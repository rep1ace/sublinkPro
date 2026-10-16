# 修复版稳定分支维护

[English](fork-maintenance.md)

本分支在国家规则、通用国家显示、后端节点重命名和内置 Clash/Surge 模板中，
按 ISO 代码为 TW 生成 🇹🇼。不会自动改写已有模板或节点名称。
如已保存的模板含有 `🇨🇳 台湾节点`，请在界面中将组名及全部引用统一改为
`🇹🇼 台湾节点`。

## 分支与 Actions

- `stable` 是默认分支，初始基于上游 `v1.2.20`；保留原始 `main`，发布以 `stable` 为准。
- `.github/upstream-version` 记录当前合入的上游版本。
- **Fork Build and Release** 执行前端旗帜回归测试、ESLint、前端生产构建、
  Go 格式检查、golangci-lint、全部 Go 测试及 Linux amd64 生产构建，并上传构建产物。
- 推送 `v1.2.20-tw.1` 这样的标签，发布包含 `sublinkPro-linux-amd64` 和
  `SHA256SUMS` 的 GitHub Release。标签必须匹配记录的上游版本；完整修复版标签写入程序版本号。
- **Fork Sync Upstream Stable** 每天 03:23 UTC（台北时间 11:23）检查上游最新正式版，
  也支持手动运行。在独立分支合并上游标签后，创建或更新目标为 `stable` 的 PR。
  因 `GITHUB_TOKEN` 创建的推送/PR 不触发通常的事件工作流，更新流程会显式触发构建。
  不需要个人令牌或服务器 SSH 密钥。
- 合并冲突会停止流程，并在 Actions 摘要列出冲突文件；需本地解决、验证后再合入。
  审阅时还需关注上游新增的旗帜逻辑及回归测试结果。
- 更新 PR 合入后构建产物，发布通过显式推送标签触发。工作流不会自动部署服务器。

仓库设置中启用 Actions、允许 Actions 创建 PR，并将 `stable` 设为默认分支，以运行定时任务。
在 Actions 设置中停用继承的 **Build and Release Multi-Platform** 和 **PR Checks**；
入口任务也限制为仅在上游仓库运行。保留其文件以便合并上游，
由本分支工作流负责检查和发布，无需 Docker Hub 凭据。
审阅更新 PR 时也要检查上游是否新增工作流文件。

审阅并合入更新后，从最新分支发布：

```bash
git switch stable
git pull --ff-only origin stable
git tag v1.2.20-tw.2   # 换成对应上游版本及下一个修复版序号
git push origin v1.2.20-tw.2
```

## 现有 systemd 部署

继续沿用 `/opt/sublinkpro/sublinkPro`、`/etc/systemd/system/sublinkpro.service`、
`/etc/sublinkpro.env` 和 `/var/lib/sublinkpro`。服务器无需 Go/Node 编译环境。
下载指定 Release 后，执行 `sha256sum -c SHA256SUMS` 验证文件，安装前设置可执行权限。
生产版前端已嵌入二进制。

更新顺序：停止 `sublinkpro`，备份旧程序和整个 `/var/lib/sublinkpro`，安装验证过的二进制，
启动服务。检查 `systemctl is-active sublinkpro`、启动日志及公开的 `GET /api/v1/version`，
确认页面和生成的节点名称使用 🇹🇼；前端资源有缓存时需强制刷新浏览器。

失败时停止服务，恢复旧程序及对应的数据快照后再启动。上游更新可能迁移数据库，
仅换回旧程序不一定能回退。数据和配置含有凭据，备份应保持私密。
避免使用会将本分支程序覆盖为官方版本的上游更新脚本。

## 本地验证与编译

使用 `go.mod` 指定的 Go、Node 24 及 `webs/package.json` 指定的 Yarn（Corepack）：

```bash
node --test scripts/tests/country-flags.test.mjs
(cd webs && yarn install --immutable && yarn run lint && yarn run build)
golangci-lint run
go test ./...
cp -a webs/dist static
printf '%s\n' v1.2.20-tw.1 > VERSION
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -tags=prod -ldflags='-s -w' -o sublink .
git restore VERSION
```
