import {defineConfig} from 'vitepress'

// 导入主题的配置
import {blogTheme} from './blog-theme'

// 如果使用 GitHub/Gitee Pages 等公共平台部署
// 通常需要修改 base 路径，通常为“/仓库名/”
// 如果项目名已经为 name.github.io 域名，则不需要修改！
// const base = process.env.GITHUB_ACTIONS === 'true'
//   ? '/vitepress-blog-sugar-template/'
//   : '/'

// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
    // 继承博客主题(@sugarat/theme)
    extends: blogTheme,
    base: '/',
    lang: 'zh-cn',
    title: 'DuebassLei',
    description: '海边的小鲸鱼🐳',
    // 详见：https://vitepress.dev/zh/reference/site-config#head
    head: [
        // 配置网站的图标（显示在浏览器的 tab 上）
        // ['link', { rel: 'icon', href: `${base}favicon.ico` }], // 修改了 base 这里也需要同步修改
        ['link', {rel: 'icon', href: '/favicon.ico'}]
    ],
    themeConfig: {
        // 展示 2,3 级标题在目录中
        outline: {
            level: [2, 3],
            label: '目录'
        },
        // 默认文案修改
        returnToTopLabel: '返回顶部',
        sidebarMenuLabel: '相关文章',
        lastUpdatedText: 'last updated',
        // 设置logo
        logo: '/logo.png',
        // editLink: {
        //   pattern:
        //     'https://github.com/ATQQ/sugar-blog/tree/master/packages/blogpress/:path',
        //   text: '去 GitHub 上编辑内容'
        // },
        nav: [
            {text: '首页', link: '/'},
            {
                text: '前端开发', items: [
                    {text: 'Vue 基础', link: '/sop/frontend/vue/vue'},
                    {text: 'React 基础', link: '/sop/frontend/react/react'},
                    {text: 'Npm 基础', link: '/sop/frontend/npm/npm'},
                    {text: 'Nvm 基础', link: '/sop/frontend/npm/nvm'},
                ]
            },
            {
                text: '后端开发', items: [
                    {text: 'Java 基础', link: '/sop/backend/java/java'},
                    {text: 'Spring Boot 基础', link: '/sop/backend/java/SpringBoot'},
                    {text: 'Spring Cloud 基础', link: '/sop/backend/java/SpringCloud'},
                ]
            },
            {
                text: '数据库', items: [
                    {text: 'Oracle 数据库', link: '/sop/datasource/oracle/oracle'},
                    {text: 'MySQL 数据库', link: '/sop/datasource/mysql/mysql'},
                    {text: 'PostgreSQL 数据库', link: '/sop/datasource/PostgreSQL/PostgreSQL'},
                    {text: '达梦数据库', link: '/sop/datasource/dameng/dameng'},

                ]
            },
            {
                text: '运维开发', items: [
                    {text: 'Ftp 基础', link: '/sop/devops/ftp/ftp'},
                    {text: 'Window 基础', link: '/sop/devops/window/window'},
                    {text: 'Linux 基础', link: '/sop/devops/linux/linux'},
                    {text: 'Docker 基础', link: '/sop/devops/docker/docker'},
                ]
            },
            {text: '中间件', items: [
                {text: 'Nginx 基础', link: '/sop/middleware/nginx/nginx'},
                {text: 'Kafka 基础', link: '/sop/middleware/kafka/kafka'},
                {text: 'Redis 基础', link: '/sop/middleware/redis/redis'},
                {text: 'RabbitMQ 基础', link: '/sop/middleware/rabbitmq/rabbitmq'},
                {text: 'Elasticsearch 基础', link: '/sop/middleware/elasticsearch/elasticsearch'},
                {text: 'Logstash 基础', link: '/sop/middleware/logstash/logstash'},
                {text: 'Kibana 基础', link: '/sop/middleware/kibana/kibana'},
                {text: 'Flink 基础', link: '/sop/middleware/flink/flink'},
                {text: 'Spark 基础', link: '/sop/middleware/spark/spark'},
            ]},
            {text: '我的作品', link: '/works'},
            {text: '关于我', link: '/about'}
        ],
        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/DuebassLei'
            },
            {
                icon: 'gitee',
                link: 'https://gitee.com/DuebassLei'
            },
            {
                icon: 'csdn',
                link: 'https://blog.csdn.net/m0_37903882'
            }
        ],

    }
})
