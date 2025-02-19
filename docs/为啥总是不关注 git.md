<!--
 * @Author: qs
 * @Date: 2025-01-24 17:45:53
 * @LastEditTime: 2025-02-19 14:11:55
 * @LastEditors: qs
 * @Description:
 * @FilePath: /coderPanz.github.io/docs/为啥总是不关注 git.md
 *
-->

# git 需要好好学

参考： [廖雪峰的网站](https://liaoxuefeng.com/books/git/what-is-git/index.html)

## what is git

git 是一个分布式版本控制系统，用于多人协助开发和管理代码，有提交记录、分支、版本回退等功能。git 最早用于管理 linux 项目的开发和维护工作，这也是 git 诞生的原因。

## 分布式 vs 集中式

集中式版本控制系统的设计核心是有一个中央服务器存储所有版本数据和历史记录，用户通过从中央服务器获取代码副本来工作。  
集中式特点：

- 单一中央服务器：版本库存储在中央服务器中，开发者需要从服务器拉取代码到本地工作，并将修改提交回服务器。
- 依赖网络连接：用户必须在线才能操作版本控制，如提交代码或查看历史记录。

常用工具：CVS 及 SVN。  
分布式版本控制系统没有“中央服务器”的概念，每个人的电脑上都是一个完整的版本库，这样，你工作的时候，就不需要联网了，因为版本库就在你自己的电脑上。  
特点：

- 无需中央服务器：每个用户都有完整的版本库副本，即使没有网络，也可以完成大部分操作，如提交、查看历史记录等。
- 离线操作：开发者可以在离线状态下完成提交、分支创建等操作。
- 高安全性：每个人电脑里都有完整的版本库，无需担心仓库误操作无法恢复等问题。

## 创建版本库

使用 `git init` 在本地创建 git 仓库，让项目可以使用 git 进行版本管理，`git init` 后这个目录会创建一个 `.git` 文件。  
**注意：** 所有的版本控制系统，其实只能跟踪文本文件的改动，而图片、视频这些二进制文件，虽然也能由版本控制系统管理，但没法跟踪文件的变化，只能把二进制文件每次改动串起来，也就是只知道图片从 100KB 改成了 120KB，但到底改了啥，版本控制系统不知道，也没法知道。

### 将文件放入仓库

- 第一步，用命令 `git add` 告诉 Git，把文件添加到仓库：`git add test.txt`。
- 第二步，用命令 `git commit` 告诉 Git，把文件提交到仓库。`git commit -m "wrote a test file"`  
  -m 后面输入的是本次提交的说明，可以输入任意内容，当然最好是有意义的，一般我们遵循 git 提交规范。

#### 为什么 Git 添加文件需要 add，commit 一共两步呢？

Git 中添加文件需要分为 add 和 commit 两步，主要是为了提供更多的灵活性和控制力。  
 当你修改了工作区的文件后，这些修改并不会立即纳入版本控制。git add 的作用是将工作区中的修改添加到 暂存区（staging area），暂存区是 Git 中一个中间层，允许你在提交之前决定哪些更改应该被包括在下一个提交中。（这样做可以实现选择性的提交，而不是一次提交所有更改，使得提交流程更加灵活。）  
 commit 后会生成版本快照和提交记录，方便记录和版本回退。

## 版本回退

`git log` 命令显示从最近到最远的提交日志，我们可以使用其查看提交记录。  
`git commit` 可以记录版本快照和提交记录，这使得我们可以进行版本回退。首先，Git 必须知道当前版本是哪个版本，在 Git 中，用 HEAD 表示当前版本，上一个版本就是 HEAD^，上上一个版本就是 HEAD^^，当然往上 100 个版本写 100 个^比较容易数不过来，所以写成 HEAD~100。  
`git reset --hard HEAD^` 命令进行版本回退，其中 --hard 参数有啥意义？--hard 会回退到上个版本的**已提交状态（无需 commit 操作）**，而--soft 会回退到上个版本的**未添加到暂存区状态**，--mixed 会回退到上个版本**已添加但未提交的状态**。现在，先放心使用--hard。

### 后悔了怎么办

如果进行版本回退后，需要复用最新版本的一段代码，所以需要回去 copy ，前提是我们需要记住最新版本的 commit id，然后输入 `git reset --hard xxxxxxxx` 即可回到指定版本。  
那如果 commit -id 忘记了怎么办，那就凉拌，在 git 中，存在命令 `git reflog` 用来记录你的每一次命令，可以记录提交信息和 commit id 。  

### 总结
- HEAD指向的版本就是当前版本，因此，Git允许我们在版本的历史之间穿梭，使用命令git reset --hard commit_id。
- 穿梭前，用git log可以查看提交历史，以便确定要回退到哪个版本。
- 要重返未来，用git reflog查看命令历史，以便确定要回到未来的哪个版本。  


## 工作区与暂存区
  &emsp;&emsp;工作区：就是你在电脑里能看到的目录，项目所在的目录。工作区中有一个 `.git` 文件，是隐藏起来的，这个不算工作区，而是Git的版本库。  
  &emsp;&emsp;Git的版本库里存了很多东西，其中最重要的就是称为stage（或者叫index）的暂存区，还有Git为我们自动创建的第一个分支master，以及指向 master的一个指针叫HEAD。  
![暂存区](/git暂存区.png)

把文件往Git版本库里添加的时候，是分两步执行的：  
- 第一步是用git add把文件添加进去，实际上就是把文件修改添加到暂存区；
- 第二步是用git commit提交更改，实际上就是把暂存区的所有内容提交到当前分支。


### 管理与修改
&emsp;&emsp;为什么Git比其他版本控制系统设计得优秀，因为Git跟踪并管理的是修改，而非文件。  
你会问，什么是修改？比如你新增了一行，这就是一个修改，删除了一行，也是一个修改，更改了某些字符，也是一个修改，删了一些又加了一些，也是一个修改，甚至创建一个新文件，也算一个修改。  
数据完整性：Git 使用 SHA-1 哈希值标识每次修改，确保数据的完整性和可追溯性。

### 撤销修改
**1. 撤销工作区的修改**  
如果你在工作区（尚未 git add）修改了文件，但想撤销这些修改，恢复到上次提交的状态，这会用最近一次提交的版本覆盖工作区的文件：  
`git checkout -- <file>`
如果你想撤销所有文件的修改：  
`git checkout -- .`  

**2. 撤销暂存区的修改**  
如果你已经将修改添加到暂存区（git add），但想撤销暂存区的修改，将其放回工作区，这会取消暂存区的修改，但不会影响工作区的文件内容。：  
`git reset HEAD <file>`  
如果你想取消所有文件的暂存：  
`git reset HEAD .`  

**3. 撤销已提交的修改**  
如果你已经提交了修改（git commit），但想撤销提交，有以下几种方式：  
(1) 回退到上个版本的**未添加到暂存区状态**: `git reset --soft HEAD^`  

(2) 回退到上个版本的**已提交状态（无需 commit 操作）**：`git reset --hard HEAD^`  

(3) 回退到上个版本**已添加但未提交的状态**: `git reset ----mixed HEAD^`  

**4. 撤销本地未推送的提交（回退到指定版本）**  
&emsp;&emsp;如果你在本地提交了多次修改，但还没有推送到远程仓库，可以通过以下方式撤销：`git reset --hard <commit-hash>`  

**5. 撤销已推送到远程仓库的提交**  
&emsp;&emsp;如果你已经将提交推送到远程仓库，建议使用 git revert 来撤销：`git revert <commit-hash>`  
- 这会生成一个新的提交，撤销指定提交的修改。
- 然后你可以将新的提交推送到远程仓库：`git push origin <branch-name>`  

总结  
- 工作区修改：`git checkout -- <file>`
- 暂存区修改：`git reset HEAD <file>`
- 已提交修改：
- 撤销提交但保留修改：`git reset --soft HEAD^`
- 撤销提交并丢弃修改：`git reset --hard HEAD^`
- 生成反向提交：`git revert HEAD`
- 已推送提交：使用 `git revert` 生成反向提交并推送。

## 远程仓库
&emsp;&emsp;在本地创建本地仓库后，需要连接远程仓库，让这两个仓库进行远程同步，这样，GitHub上的仓库既可以作为备份，又可以让其他人通过该仓库来协作，真是一举多得。  
`git remote add origin git@github.com:abb/bba`  

添加后，远程库的名字就是origin，这是Git默认的叫法，也可以改成别的，但是origin这个名字一看就知道是远程库。  
`git push <远程仓库名> <分支名>` 
下一步，就可以把本地库的所有内容推送到远程库上：`git push -u origin master`  
把本地库的内容推送到远程，用git push命令，实际上是把当前分支master推送到远程。  
由于远程库是空的，我们第一次推送master分支时，加上了-u参数，Git不但会把本地的master分支内容推送的远程新的master分支，还会把本地的master分支和远程的master分支关联起来，在以后的推送或者拉取时就可以简化命令。  
从现在起，只要本地作了提交，就可以通过命令：`git push origin master` 把本地 master 分支的最新修改推送至GitHub，现在，你就拥有了真正的分布式版本库！

- `git push`: 如果当前分支已经与远程分支关联，可以直接运行 git push。
- `git push origin <分支名>`: 推送指定分支到远程仓库。
- `git push -u origin <分支名>`: 推送并设置上游分支（关联远程分支）
- `git push --force`: 强制推送会覆盖远程仓库的历史记录，慎用！通常用于修复提交历史或回退提交。

QA：如果我在本地新建了一个分支 test，但远程并没有该分支，那我应该怎么进行推送。  
`git push -u origin test`
- -u 或 --set-upstream：将本地分支与远程分支关联，并设置远程分支为默认的上游分支。  
- origin：远程仓库的名称（通常是 origin）。
- test：本地分支的名称。

执行后，Git 会在远程仓库中创建一个同名分支 test，并将本地分支的提交推送到远程分支。

验证推送结果: 推送完成后，你可以通过以下命令查看远程分支是否创建成功：`git branch -r`,这会列出所有远程分支，你应该能看到 origin/test。

后续操作: 一旦本地分支与远程分支关联，可以直接使用 `git push` 。

## 分支管理
### 分支的创建与切换
&emsp;&emsp;每次提交，Git都把它们串成一条时间线，这条时间线就是一个分支。截止到目前，只有一条时间线，在Git里，这个分支叫主分支，即master分支。HEAD严格来说不是指向提交，而是指向master，master才是指向提交的，所以，HEAD指向的就是当前分支。  

一开始的时候，master分支是一条线，Git用master指向最新的提交，再用HEAD指向master，就能确定当前分支，以及当前分支的提交点：  

![分支管理](/分支管理.png)  

&emsp;&emsp;每次提交，master分支都会向前移动一步，这样，随着你不断提交，master分支的线也越来越长。  
当我们创建新的分支，例如dev时，Git新建了一个指针叫dev，指向master相同的提交，再把HEAD指向dev，就表示当前分支在dev上：  

![分支管理二](/分支管理二.png)  

Git创建一个分支很快，因为除了增加一个dev指针，改改HEAD的指向，工作区的文件都没有任何变化！  
不过，从现在开始，对工作区的修改和提交就是针对dev分支了，比如新提交一次后，dev指针往前移动一步，而master指针不变：  

![分支管理三](/分支管理三.png)  
假如我们在dev上的工作完成了，就可以把dev合并到master上。Git怎么合并呢？最简单的方法，就是直接把master指向dev的当前提交，就完成了合并：  

![分支管理四](/分支管理四.png)  
所以Git合并分支也很快！就改改指针，工作区内容也不变！  

合并完分支后，甚至可以删除dev分支。删除dev分支就是把dev指针给删掉，删掉后，我们就剩下了一条master分支：  
![分支管理五](/分支管理五.png)  

### switch
我们注意到切换分支使用 `git checkout <branch>`，而前面讲过的撤销修改则是 `git checkout -- <file>`，同一个命令，有两种作用，确实有点令人迷惑。  

实际上，切换分支这个动作，用switch更科学。因此，最新版本的Git提供了新的git switch命令来切换分支：  

创建并切换到新的dev分支，可以使用：`git switch -c dev`; 直接切换到已有的master分支，可以使用：`git switch master`，使用新的git switch命令，比git checkout要更容易理解。  

小结
- 查看分支：`git branch`
- 创建分支：`git branch <name>`
- 切换分支：`git checkout <name>或者git switch <name>`
- 创建+切换分支：`git checkout -b <name>或者git switch -c <name>`
- 合并某分支到当前分支：`git merge <name>`
- 删除分支：`git branch -d <name>`


### 冲突问题
&emsp;&emsp;切换分支的唯一条件是工作区必须是干净的（没有未提交的修改）。  
在 master 分支中切一个 feature1 新的分支，并在这个分支对文件进行修改，提交后进行切换，并在 master 分支上进行修改后并提交，下面是两个分支的提交情况。  
![分支管理六](/分支管理六.png)  

这种情况下 `git merge feature1`，Git无法执行“快速合并”，只能试图把各自的修改合并起来，但这种合并就可能会有冲突，**需要手动解决冲突后再提交**。  

解决冲突后：master 分支和 feature1 分支变成了下图所示：  
![分支管理七](/分支管理七.png)  

### 分支管理策略
通常，合并分支时，如果可能，Git会用Fast forward模式，但这种模式下，删除分支后，会丢掉分支信息。如果要强制禁用Fast forward模式，Git就会在merge时生成一个新的commit，这样，从分支历史上就可以看出分支信息。  

我们使用 `--no-ff` 方式的 git merge：  
首先，仍然创建并切换dev分支：`git switch -c dev`  
修改文件后，并提交一个新的commit：`git add readme.txt && commit -m "add merge"`  
现在，我们切换回master：`git switch master`  
准备合并dev分支，请注意--no-ff参数，表示禁用Fast forward：`git merge --no-ff -m "merge with no-ff" dev`,因为本次合并要创建一个新的commit，所以加上-m参数，把commit描述写进去。  
合并后，我们用git log看看分支历史, 可以看到，不使用Fast forward模式，merge后就像这样：  
![分支管理八](/分支管理八.png)  

合并分支时，加上--no-ff参数就可以用普通模式合并，合并后的历史有分支，能看出来曾经做过合并，而fast forward合并就看不出来曾经做过合并。  

### 多人协作
当你从远程仓库克隆时，实际上Git自动把本地的master分支和远程的master分支对应起来了，并且，远程仓库的默认名称是origin。  
推送分支： 推送分支，就是把该分支上的所有本地提交推送到远程库。推送时，要指定本地分支，这样，Git就会把该分支推送到远程库对应的远程分支上,`git push origin master`。  

### Rebase
  
**多人在同一个分支上协作时**，很容易出现冲突。即使没有冲突，后push的童鞋不得不先pull，在本地合并，然后才能push成功，每次合并再push，让分支管理变得混乱。  

每次合并再push后，分支变成了这样：  
```git
$ git log --graph --pretty=oneline --abbrev-commit
* d1be385 (HEAD -> master, origin/master) init hello
*   e5e69f1 Merge branch 'dev'
|\  
| *   57c53ab (origin/dev, dev) fix env conflict
| |\  
| | * 7a5e5dd add env
| * | 7bd91f1 add new env
| |/  
* |   12a631b merged bug fix 101
|\ \  
| * | 4c805e2 fix bug 101
|/ /  
* |   e1e9c68 merge with no-ff
|\ \  
| |/  
| * f52c633 add merge
|/  
*   cf810e4 conflict fixed
```

  &emsp;&emsp;总之看上去很乱，有强迫症的童鞋会问：为什么Git的提交历史不能是一条干净的直线？  
**Git有一种称为rebase的操作，有人把它翻译成“变基”**。从实际问题出发，看看怎么把分叉的提交变成直线。  
场景：在和远程分支 master 同步后，对某个文件进行修改并提交
```git
$ git log --graph --pretty=oneline --abbrev-commit
* 582d922 (HEAD -> master) add author
* 8875536 add comment
* d1be385 (origin/master) init hello
*   e5e69f1 Merge branch 'dev'
|\  
| *   57c53ab (origin/dev, dev) fix env conflict
| |\  
| | * 7a5e5dd add env
| * | 7bd91f1 add new env
...
```
  (HEAD -> master)和(origin/master)标识出当前分支的最新提交HEAD和远程origin的位置分别是582d922 add author和d1be385 init hello，**说明本地分支比远程分支快两个提交。**  
 如果现在尝试推送 `master` 分支的话，结果是失败的。失败原因：


















