# SQL和NoSQL
## 介绍

*MongoDB 是一个基于分布式文件存储的数据库。由 C++ 语言编写。旨在为 WEB 应用提供可扩展的高性能数据存储解决方案。*另外它是非关系型数据库。关系数据库和非关系数据库是应用程序的两种数据存储方法。

关系数据库（或 SQL 数据库）以二维表格的形式存储数据。 存在主键和外键，主键用于唯一地标识一条记录，而外键则用于建立表与表之间的关系。主键可以是表中任意一个字段，但通常会选择一个具有唯一性的字段作为主键。例如，在一个用户表中，可以选择用户的 ID 字段作为主键。主键的作用是确保表中的每条记录都可以被唯一地标识。这在数据查询、修改和删除等操作中非常有用。如果没有主键，就无法准确地确定一条记录，这样就会影响数据库的数据完整性和一致性。外键用于建立表与表之间的关联关系。外键是一个字段或字段组合，它与另一个表的主键相对应。外键用于确保表之间的数据完整性和一致性。当一个表的字段被作为外键引用到另一个表的主键时，这两个表之间就建立了关联关系。

非关系型数据库存储数据的形式是多样化的，例如以键值对的形式存储数据的键值数据库。在一个键值对中，键用作唯一标识符。键和值都可以是从简单对象到复杂复合对象的任何内容。 以文档模型的形式存储数据的mongodb数据库，它们将数据存储为 JSON 对象，这些对象具有灵活、半结构化和分层的性质。



## 区别

关系数据库以表格形式存储数据，并遵循数据和表表结构规则严格规则。支持处理结构化数据的复杂查询，**同时保持数据的完整性和一致性。**

非关系数据库则更加注重灵活，适用于需求不断变化的数据。您可以使用它们来存储图像、视频、文档以及其他半结构化和非结构化内容。

原子性、一致性、隔离性和持久性（ACID）是指数据库在数据处理中出现错误或中断的情况下保持数据完整性的能力。关系型数据库严格遵循ACID。非关系数据库可以保证可用性，但不能保证即时一致性。

关系数据库的性能取决于其磁盘系统。要提高数据库性能，这意味这需要配置更高规格的磁盘以提高读写速度，还必须优化索引、表结构和查询。NoSQL 数据库的性能取决于网络延迟、硬件集群大小和调用应用程序。与关系数据库相比，NoSQL 数据库为特定应用场景提供更高的性能和可扩展性。



## 选择

关系型数据库的最大优点就是事务的一致性，这个特性，使得关系型数据库中可以适用于一切要求一致性比较高的系统中。比如：银行系统。但是在网页应用中，对这种一致性的要求不是那么的严格，允许有一定的时间间隔，所以关系型数据库这个特点不是那么的重要了。相反，关系型数据库为了维护一致性所付出的巨大代价就是读写性能比较差。而像一些博客、社交网站应用，对于并发读写能力要求极高，关系型数据库是需要消耗极大的代价维护的。



