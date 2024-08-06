# UDP-用户数据报协议

## 介绍

**用户数据报协议**是一个简单的面向[数据包](https://zh.wikipedia.org/wiki/資料包)的[通信协议](https://zh.wikipedia.org/wiki/通信协议)，位于[OSI模型](https://zh.wikipedia.org/wiki/OSI模型)的[传输层](https://zh.wikipedia.org/wiki/传输层)。

UDP只提供[数据](https://zh.wikipedia.org/wiki/資料)的不可靠传递，它一旦把应用程序发给网络层的数据发送出去，就不保留数据备份。它无需[握手](https://zh.wikipedia.org/wiki/握手_(技术))会话，即将不[可靠](https://zh.wikipedia.org/wiki/可靠性_(计算机网络))的底层网络直接暴露给了用户的应用程序：不保证消息交付、不保证交付顺序也不保证消息不重复。

## 可靠性

由于UDP缺乏[可靠性](https://zh.wikipedia.org/wiki/可靠性_(计算机网络))且属于[无连接](https://zh.wikipedia.org/wiki/無連接式通訊)协议，所以应用程序通常必须容许一些[丢失](https://zh.wikipedia.org/wiki/丢包)、错误或重复的[数据包](https://zh.wikipedia.org/wiki/数据包)。

一些应用程序不太需要可靠性机制，甚至可能因为引入可靠性机制而降低性能，所以它们使用UDP这种缺乏可靠性的协议。流媒体，实时多人游戏和IP语音（[VoIP](https://zh.wikipedia.org/wiki/VoIP)）是经常使用UDP的应用程序。在这些特定应用中，丢包通常不是重大问题。如果应用程序需要高度可靠性，则可以使用诸如[TCP](https://zh.wikipedia.org/wiki/传输控制协议)之类的协议。

由于UDP缺乏[拥塞控制](https://zh.wikipedia.org/wiki/拥塞控制)，所以需要基于网络的机制来减少因失控和高速UDP流量负荷而导致的拥塞崩溃效应。