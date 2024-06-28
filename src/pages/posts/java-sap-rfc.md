---
layout: "../../layouts/MarkdownPost.astro"
title: "Java Springboot 调用 SAP RFC"
pubDate: 2024-06-28
description: ""
author: "李玉成"
cover:
  url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/SAP_2011_logo.svg/1920px-SAP_2011_logo.svg.png"
  square: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/SAP_2011_logo.svg/1920px-SAP_2011_logo.svg.png"
  alt: "cover"
tags: ["周刊"]
theme: "light"
featured: true
---

# 准备 3 个文件

libsapjco3.so，sapjco3.dll，sapjco3.jar

# 示例代码

Java Springboot 程序调用 SAP RFC 函数的步骤如下:

1. 引入所需依赖

在 pom.xml 中添加以下依赖:

```xml
<dependency>
    <groupId>com.sap.conn.jco</groupId>
    <artifactId>sapjco3</artifactId>
    <version>3.0.17</version>
</dependency>
```

2. 配置 SAP 连接参数

在 application.properties 中添加以下配置:

```
sap.jco.ashost=your_sap_host
sap.jco.sysnr=your_sap_system_number
sap.jco.client=your_sap_client
sap.jco.user=your_sap_username
sap.jco.passwd=your_sap_password
sap.jco.lang=EN
```

3. 创建 SAP RFC 配置类

创建一个配置类,用于初始化 SAP JCo 连接:

```java
@Configuration
public class SapRfcConfiguration {

    @Value("${sap.jco.ashost}")
    private String ashost;

    @Value("${sap.jco.sysnr}")
    private String sysnr;

    @Value("${sap.jco.client}")
    private String client;

    @Value("${sap.jco.user}")
    private String user;

    @Value("${sap.jco.passwd}")
    private String password;

    @Value("${sap.jco.lang}")
    private String lang;

    @Bean
    public JCoDestination jCoDestination() {
        try {
            JCoDestinationManager.getDestination("ABAP_AS_WITH_POOL");
        } catch (JCoException e) {
            JCoDestinationManager.registerDestination("ABAP_AS_WITH_POOL",
                JCoDestinationManager.createDestination(
                    ashost, sysnr, client, user, password, lang));
        }
        return JCoDestinationManager.getDestination("ABAP_AS_WITH_POOL");
    }

}
```

4. 调用 SAP RFC 函数 在需要调用 SAP RFC 函数的地方,注入上一步创建的 JCoDestinationbean,并使用它来调用 RFC 函数:

```java
@Service
public class SapRfcService {

    private final JCoDestination jCoDestination;

    public SapRfcService(JCoDestination jCoDestination) {
        this.jCoDestination = jCoDestination;
    }

    public void callRfcFunction() {
        try {
            JCoFunction function = jCoDestination.getRepository().getFunction("RFC_FUNCTION_NAME");
            function.getImportParameterList().setValue("PARAM1", "value1");
            function.getImportParameterList().setValue("PARAM2", "value2");
            function.execute(jCoDestination);

            // 获取返回值
            String result = function.getExportParameterList().getString("RESULT");
        } catch (JCoException e) {
            // 异常处理
        }
    }

}
```

这里需要注意的是,在调用 RFC 函数时,需要提供正确的函数名和参数,这些信息需要根据具体的 SAP 系统和 RFC 函数来确定。

# windows 运行

把 sapjco3.dll 放到目录 C:\Windows\System32  
maven 安装 sapjco3.jar 到本地仓库时会重命名为 sapjco3-版本号.jar。  
3.0.11 版本之后的程序运行时会出现不允许重命名 sapjco3.jar。  
此时可以把 jar 包放到项目文件夹下引用，比如新建一个 lib，把 jar 包放到 lib 下面。

修改 pom.xml 如下：

```xml
<!--SAP RFC函数调用-->
<dependency>
    <groupId>com.sap.conn.jco</groupId>
    <artifactId>sapjco3</artifactId>
    <version>3.1.7</version>
    <scope>system</scope>
    <systemPath>${basedir}/lib/sapjco3.jar</systemPath>
</dependency>
```

# 打包部署 linux

maven 默认打包时不会把 lib 下的 jar 包打进 jar 里面。pom.xml 添加：

```xml
<resources>
    <resource>
        <directory>${basedir}/lib</directory>
        <targetPath>BOOT-INF/lib/</targetPath>
        <includes>
            <include>**/*.jar</include>
        </includes>
    </resource>
    <resource>
        <directory>${basedir}/lib</directory>
        <targetPath>BOOT-INF</targetPath>
        <includes>
            <include>**/*.dll</include>
            <include>**/*.so</include>
        </includes>
    </resource>
    <resource>
        <directory>src/main/resources</directory>
        <!--<targetPath>BOOT-INF/classes/</targetPath>-->
        <includes>
            <include>**/*.*</include>
        </includes>
    </resource>
</resources>
```

# 服务器上配置 libsapjco3.so

1. 将 libsapjco3.so 复制到系统的库路径中。通常可以使用以下命令:

```shell
sudo cp libsapjco3.so /usr/lib/
```

如果系统使用 64 位 Linux,可能需要将文件复制到/usr/lib64/目录下。

2. 更新系统的库缓存,以便应用程序可以找到 libsapjco3.so 库:

```shell
sudo ldconfig
```

3. 验证库是否已正确安装,可以使用以下命令:

```shell
ldd /usr/lib/libsapjco3.so
```

这个命令应该会列出 libsapjco3.so 所依赖的其他库,如果一切正常,应该可以看到它们都已解决。

如果仍有问题,可以尝试检查一下 libsapjco3.so 文件的权限:

```shell
ls -l /usr/lib/libsapjco3.so
```

它应该显示类似于 -rwxr-xr-x 1 root root 12345 Mar 15 12:34 /usr/lib/libsapjco3.so 的输出。

如果权限不正确,可以使用 chmod 命令修改权限:

```shell
sudo chmod 755 /usr/lib/libsapjco3.so
```

这将为文件设置读取和执行权限。  
再次尝试 ldd 命令,应该就能顺利查看依赖关系了。

# 参考：
https://juejin.cn/post/6914109294887567373
https://stackoverflow.com/questions/24765243/sapjco-3-0-11-with-maven-it-is-not-allowed-to-rename-or-repackage-the-original
