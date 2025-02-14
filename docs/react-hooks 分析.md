# reac-hooks 技术分析
批量下载模块解析
```js
import { create } from "zustand";
import { message } from "antd";
import mime from "mime";

type DownloadStatus =
  | "pending"
  | "downloading"
  | "completed"
  | "failed"
  | "canceled";

interface DownloadTask {
  progress: number; // 下载进度
  status: DownloadStatus; // 当前状态
  filename: string; // 文件名
  total?: number; // 总大小
  loaded?: number; // 已下载大小
  ext?: string;
  controller?: AbortController; // 用于中止下载
}

interface DownloadState {
  tasks: Record<string, DownloadTask>; // URL 映射到任务
  maxConcurrentDownloads: number; // 最大并发下载数

  updateTask: (key: string, task: Partial<DownloadTask>) => void;
  deleteTask: (key: string) => void;
  download: (url: string, filename: string) => void; // 对外方法
  scheduleDownloads: () => void;
  abortDownload: (url: string) => void; // 中止下载方法
}
// 模块化设计：将下载逻辑将下载逻辑封装在 store 中，便于复用
// 基于 Zustand 状态管理的下载管理器，主要功能包括并发下载控制、下载进度跟踪、下载中断等
const useDownloadStore = create<DownloadState>((set, get) => ({
  // set：set 用于更新 store 中的状态。它接受一个函数或对象作为参数，返回新的状态。触发组件的重新渲染
  // get：get 用于获取 store 的当前状态。它不需要参数，直接返回当前的状态对象
  // 结合使用的场景：updateTask 使用 set 更新指定任务的状态；deleteTask 使用 get获取当前任务状态，判断是否需要中止下载，使用 set 删除任务；scheduleDownloads ：get 获取当前任务列表和并发数，set 更新任务任务状态。
  //  create 方法创建了一个 Zustand store
  // 维护了一个task对象家，URL 为 key 存储各个下载任务的状态
  tasks: {},
  maxConcurrentDownloads: 3, // 控制最大并发数

  // 更新指定任务的状态
  updateTask: (key, task) =>
    set((state) => {
      // 存在任务才更新
      if (state.tasks[key]) {
        return {
          tasks: {
            ...state.tasks,
            [key]: { ...state.tasks[key], ...task }
          }
        };
      }
      return state;
    }),

  // 删除任务，如果正在下载则中止
  deleteTask: (key) =>
    set((state) => {
      const newTasks = { ...state.tasks };
      console.log("newTasks", newTasks);
      const { status, filename } = newTasks[key];

      // 如果任务正在下载，中止下载
      if (status === "downloading") {
        get().abortDownload(key);
      }

      if (["pending", "downloading"].includes(status)) {
        message.warning(`<${filename}> 已取消下载`);
      }
      delete newTasks[key];
      return { tasks: newTasks };
    }),

  // 添加下载任务
  download: (url, filename) => {
    const { tasks, scheduleDownloads } = get();

    if (["pending", "downloading"].includes(tasks[url]?.status)) {
      message.warning(`<${filename}> 已在下载队列中`);
      return;
    }

    // 添加任务为 pending 状态
    set((state) => ({
      tasks: {
        ...state.tasks,
        [url]: { filename, progress: 0, status: "pending" }
      }
    }));

    scheduleDownloads(); // 启动调度
  },

  // 中止指定下载任务
  abortDownload: (url) => {
    const task = get().tasks[url];
    if (task && task.controller) {
      task.controller.abort(); // 中止下载请求
      get().updateTask(url, { status: "canceled" });
    }
  },

  // 调度下载任务，控制并发
  scheduleDownloads: () => {
    const { tasks, maxConcurrentDownloads, updateTask } = get();

    const downloadingTasks = () =>
      Object.values(get().tasks).filter(
        (task) => task.status === "downloading"
      );

    const pendingTasks = () =>
      Object.entries(get().tasks).filter(
        ([, task]) => task.status === "pending"
      );

    const trySchedule = () => {
      while (
        downloadingTasks().length < maxConcurrentDownloads &&
        pendingTasks().length > 0
      ) {
        const [url, task] = pendingTasks().shift()!;

        // 为每个任务创建 AbortController
        const controller = new AbortController();
        updateTask(url, { status: "downloading", controller });

        // 开始实际下载
        startDownload(url, task.filename, controller);
      }
    };

    trySchedule();

    // 实际执行下载的核心方法
    async function startDownload(
      url: string,
      filename: string,
      controller: AbortController
    ) {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`下载失败: ${response.statusText}`);

        const contentType = response.headers.get("Content-Type");
        const ext = mime?.getExtension(contentType ?? "") ?? "";
        const baseName = filename || url.split("/").pop() || "file";
        const name = baseName.endsWith(ext)
          ? baseName
          : [baseName, ext].filter(Boolean).join(".");
        updateTask(url, { ext });

        const total = parseInt(
          response.headers.get("Content-Length") || "0",
          10
        );
        // 使用流式读取（getReader()）处理大文件
        const reader = response.body?.getReader();
        if (!reader) throw new Error("读取流失败");

        let loaded = 0;
        const chunks: Uint8Array[] = [];

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            loaded += value.length;
            const progress = total ? ((loaded / total) * 100).toFixed(0) : "0";
            updateTask(url, { progress: Number(progress), loaded, total });
            chunks.push(value);
          }
        }

        // 使用 Blob 和 URL.createObjectURL 优化文件保存
        const blob = new Blob(chunks);
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = name;
        link.click();
        URL.revokeObjectURL(blobUrl);

        updateTask(url, { status: "completed" });
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.warn(`下载被取消: ${url}`);
        } else {
          console.error("下载失败", error);
          updateTask(url, { status: "failed" });
        }
      } finally {
        trySchedule(); // 下载完成后尝试调度新的任务
      }
    }
  }
}));

export default useDownloadStore;
```

```js
import useDownloadStore from "./model";
import {
  notification,
  Progress,
  Button,
  type NotificationArgsProps,
  Typography,
  message,
  Modal,
  Alert,
  type AlertProps
} from "antd";
import prettyBytes from "pretty-bytes";
import React, {
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef
} from "react";
import mime from "mime";
import type { ComponentPropsWith } from "@/types";
import { CloseSquareFilled } from "@ant-design/icons";

const { Link, Text } = Typography;

// 负责实时渲染下载状态，通常挂载在应用的根组件中
export const DownloadProvider = () => {
  // useDownloadStore 来获取下载任务的状态、删除任务、取消下载等
  const { tasks, deleteTask, download, maxConcurrentDownloads } =
    useDownloadStore();

  // Ant Design 的 notification 组件来创建一个通知实例，并配置批量的堆叠行为
  const [api, contextNotification] = notification.useNotification({
    stack: {
      threshold: maxConcurrentDownloads // 下载数量超过指定数量后启用堆叠行为
    }
  });

  // 使用 useEffect 监听下载任务的变化，实时更新 UI
  useEffect(() => {
    api.destroy(); // 清除现有通知
    // 为什么要在useEffect中遍历渲染下载ui组件：批量下载任务变化后，ui 的渲染也需要实时变化。
    Object.entries(tasks).forEach(
      ([key, { status, progress, filename, loaded = 0, total = 0 }]) => {
        // 遍历所有下载任务生成堆叠下载ui
        const Desc = () => {
          const [speed, setSpeed] = React.useState("0 B/s");
          const prevLoadedRef = React.useRef(0);
          const prevTimeRef = React.useRef(Date.now());

          // 显示实时下载速度
          React.useEffect(() => {
            const now = Date.now();
            const timeDiff = now - prevTimeRef.current; // 秒
            const loadedDiff = loaded - prevLoadedRef.current;

            if (timeDiff > 0) {
              setSpeed(prettyBytes(loadedDiff / timeDiff) + "/s");
            }

            prevLoadedRef.current = loaded;
            prevTimeRef.current = now;
          }, [loaded]);

          return (
            <>
              <div>
                <div className="truncate">{filename}</div>
                <div>
                  <Text className="shrink-0 text-12px" type="secondary">
                    {/* 实时文字进度*/}
                    {prettyBytes(loaded)}/{prettyBytes(total)} · {speed}
                  </Text>
                </div>
                {/* 实时进度条 */}
                <Progress percent={progress} />
              </div>
            </>
          );
        };

        // 监听下载任务的状态来（pending、downloading、completed、failed），实时渲染下载状态
        const notice = (
          args: Omit<NotificationArgsProps, "key" | "description">
        ) => {
          const { onClose, ...rest } = args;
          api.open({
            type: "info",
            placement: "bottomLeft",
            duration: 1.5,
            showProgress: true,
            pauseOnHover: false,
            ...rest,
            key,
            description: <Desc />,
            onClose: () => {
              try {
                deleteTask(key);
                onClose?.();
              } catch (error) {
                console.error(error);
              }
            }
          });
        };

        if (["pending"].includes(status)) {
          notice({
            type: "warning",
            message: "等待下载...",
            duration: 0,
            btn: (
              <>
                {/* 提供重试功能，当下载失败时用户可以点击重试按钮重新下载*/}
                <Button type="primary" onClick={() => download(key, filename)}>
                  暂停
                </Button>
              </>
            )
          });
          return;
        }
        if (["downloading"].includes(status)) {
          notice({
            type: "info",
            message: "正在下载...",
            duration: 0
            // closable: false
          });
          return;
        }
        if (["completed"].includes(status)) {
          notice({
            type: "success",
            message: "下载完成"
          });
          return;
        }
        if (["failed"].includes(status)) {
          notice({
            type: "error",
            message: "下载失败",
            btn: (
              <>
                {/* 提供重试功能，当下载失败时用户可以点击重试按钮重新下载*/}
                <Button type="primary" onClick={() => download(key, filename)}>
                  重试
                </Button>
              </>
            ),
            duration: 0
          });
          return;
        }
      }
    );
  }, [tasks, deleteTask, api, download]);

  return <>{contextNotification}</>;
};

type DownloadBaseProps = {
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
};

type PropsWithChildren = {
  children: React.ReactNode;
  url: string;
  filename: string;
} & DownloadBaseProps;

type PropsWithoutChildren = {
  children?: never;
  url?: string;
  filename?: string;
} & DownloadBaseProps;

// 提供下载功能的触发组件，支持单个和批量下载
// 使用方式：1. 支持 children：点击元素触发下载；2. 通过 forwardRef 暴露下载方法给父组件下载
// 支持批量下载功能，通过 batchDownload 方法可以同时下载多个文件
// 支持自定义样式和点击事件
export const Download = forwardRef(
  (
    props: PropsWithChildren | PropsWithoutChildren,
    ref: React.Ref<{
      download: (url: string, filename: string) => void;
    }>
  ) => {
    const { children, className, style, url, filename, onClick, ...rest } =
      props;

    const { download } = useDownloadStore();

    useImperativeHandle(ref, () => ({
      download,
      // 批量下载
      batchDownload: (items: { url: string; filename: string }[]) => {
        items.forEach(({ url, filename }) => {
          download(url, filename);
        });
      }
    }));

    return (
      <>
        <span
          className={className}
          style={style}
          onClick={(e) => {
            if (url && filename) {
              download(url, filename);
            }
            onClick?.(e);
          }}
          {...rest}
        >
          {children}
        </span>
      </>
    );
  }
);
```