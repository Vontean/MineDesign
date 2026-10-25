# MineDesign 分叉来源与许可

MineDesign 独立维护源码。此文件是唯一分叉记录，不在构建或运行时同步上游。

- 来源：https://github.com/JimLiu/baocut
- 固定提交：`7aa049e82e1367da013b7aba80f0b79033fa04ad`
- 接管范围：设计稿、设计系统编辑器及其共享文件、宿主、消息与国际化实现。
- 原目录映射：`apps/*-editor` → `apps/`；两个 runtime → `packages/*-runtime`；design / design-system 的 Node 文件能力 → `packages/*-files`，浏览器宿主 → `packages/editor-host`；slides 的存储/HTTP → `packages/document-store`，浏览器桥 → `packages/editor-host`，线协议 → `packages/contracts`；protocol 仅保留实际使用的 i18n 与作品概要类型。
- 后续更新：在独立临时目录比较固定提交与候选版本，按模块选择变更；经接口、视觉和交互回归后纳入。更新此文件中的来源提交与变更说明。
- 内部包名归 MineDesign 管理；文件格式、`__deck/*` 路由、全局宿主能力名和 postMessage 名是兼容契约，迁移目录不改变它们。

## 分叉前的适配


- 根 npm overrides 将 happy-dom 更新到 21.0.4，修复安装时发现的 GHSA-834v-8h66-3h79；快速编辑仍关闭。
- Worker 浏览器适配补 domainToASCII，满足修复版 happy-dom 的 URL 接口。
- 保留上游 tsconfig.json，保证 JSX 按 react-jsx 编译。
- 编辑器外观仅在构建产物注入本地 theme adapter，不改用户画板。

- React 18 UMD 改从 MineDesign 独立 preview-react18 workspace 读取，替代 npm alias；编辑器与其依赖统一使用根 React 19。
- 两个编辑器入口（apps/*-editor/src/main.ts）读取 `globalThis.__MDN_FRAME__.base` 作为路由根：Codex 沙箱禁止访问本地 HTTP，编辑器改为 srcdoc 装载，`location.href` 是 `about:srcdoc`，无法推算路由根。未设置时行为与上游相同。
- design-runtime 的 `currentHttpOrigin()` 接受当前窗口的 `codex-sandbox://` 来源，避免把同源画板消息误判为 `null`；保留 source、完整 origin 与 MessagePort 存活检查。
- CDS 图标组件（design-runtime `cds/components/icon.tsx` 与 design-system-runtime `ui/interactions.tsx`）在字形有 Lucide 对照时改画 SVG，对照表为新增的 `cds/components/lucide-icons.ts`；带动画的字形与未对照的字形仍走 Anthropicons 字体。线宽由外壳注入的 `--mdn-icon-stroke` 控制。

## 原始许可全文

```text
BaoCut Community License
Version 1.0 — October 7, 2026

Copyright (c) 2026 Jim Liu and BaoCut contributors.

This is a source-available license. It permits commercial content creation and
internal business use, but requires a separate written license to commercialize
BaoCut itself or its code. The English text in this file is authoritative;
summaries and translations do not change its terms.

1. Scope and definitions

"Software" means the BaoCut code, binaries, documentation, templates, and other
original project materials supplied with this license, including any portion
of them and modifications based on them. Separately licensed components are
excluded as described in section 7.

"Licensor" means each copyright holder, or its authorized representative,
offering its Software under this license. "You" means the person or organization
exercising the permissions granted here.

"Content" means creative outputs made using the Software: videos, audio,
images, captions, documents, editable media projects, and code that represents
or renders those creative outputs. Content also includes original BaoCut
template elements incorporated into those outputs. Copies of the Software or
its implementation code used to build a software product, library, platform,
or service are not Content merely because they were exported or generated
using BaoCut.

"Internal use" means using or modifying the Software within your organization
for its own operations, with access limited to its personnel and contractors
acting on its behalf. Giving customers finished Content is internal use;
giving outside users access to the Software's functions as a commercial
service is not.

2. Community permissions

Provided you comply with this license, each Licensor permits you to run,
inspect, copy, and modify its Software worldwide without license fees for:

(a) personal activities, learning, research, experimentation, and other
    noncommercial purposes;
(b) internal use, including use by businesses and paid internal development;
(c) creating, editing, rendering, publishing, selling, and delivering Content
    for any purpose, including advertisements, monetized videos, commissioned
    work, and paid editing services.

You may share the original Software or a modified version for noncommercial
purposes, without charging for it or including it in a paid product or bundle,
subject to section 5. Recipients receive permission for the covered Software
directly from the applicable Licensors under this license. You cannot grant
them broader rights to that Software than you have received.

You may charge for consulting, installation, training, support, and development
on a customer's installation when that customer's use is permitted by this
license or a separate commercial license. This permission does not allow you
to sell Software copies, software licenses, or access to a hosted service, or
to deliver the Software as part of a commercial software product.

3. Commercialization requires a separate license

The following activities are outside the community permissions and require a
separate written commercial license from the applicable rights holders before
you undertake them:

(a) selling, renting, licensing for a fee, or otherwise commercially
    distributing the Software, copies of it, or modified versions, including
    installers, rebranded versions, paid bundles, and white-label products;
(b) operating the Software or a modified version for outside users as a
    commercial hosted service, platform, or API, whether access is charged
    directly or monetized through subscriptions, advertising, sponsorship,
    or inclusion in another commercial offering;
(c) incorporating any Software code, binaries, or engine into a commercial
    software product, library, SDK, appliance, or service supplied to others.

These restrictions apply whether you modify the Software or leave it unchanged,
and whether you disclose your source code or keep it private. Publishing a fork
or offering some features without charge does not waive these restrictions.

Selling or monetizing Content alone is not commercialization of the Software.
An independently written plugin, integration, or client that only uses BaoCut's
public interfaces and contains no Software code is not covered by this license
merely because it interoperates with BaoCut. Your use or distribution of BaoCut
alongside it, and any commercial hosting of BaoCut, remain subject to this
license.

For commercial licensing, contact the project maintainer, Jim Liu, at
junminliu@gmail.com. A request, payment, or publication of source code does not
itself grant a commercial license. Only a written agreement from a party
authorized to grant the relevant rights can do so.

4. Rights in Content

This license imposes no license fee, revenue share, BaoCut attribution,
watermark, or source-disclosure requirement on your Content. The Licensors
claim no ownership of your Content merely because you used the Software.

To the extent a Licensor's original templates or other creative elements
provided for incorporation into Content appear in your Content, that Licensor
permits you to reproduce, adapt, distribute, perform, display, and commercially
exploit those elements as part of the Content, and to authorize recipients to
do the same, without requiring them to license BaoCut. This permission does not
cover distributing the Software as a product or library.

Rights in third-party inputs, assets, fonts, models, voices, and generated
material depend on their own terms and applicable law. This license neither
changes those terms nor promises that all outputs are free of other rights.

5. Redistribution and identification

For any redistribution permitted by this license, include this complete license
with the Software and retain applicable copyright, attribution, and third-party
license notices. Mark modified versions as modified and identify them so that
recipients can distinguish them from official BaoCut releases.

You retain rights in your own modifications. Any terms you apply to them cannot
remove or replace this license's conditions on the covered Software.

This license grants no right to use BaoCut names, logos, or other trademarks
as your own branding or to suggest official approval or affiliation. Accurate
references to the Software's origin and legally permitted trademark uses are
unaffected.

6. Patents and reserved rights

Each Licensor also permits uses authorized by this license under patent claims
it controls that would necessarily be infringed by its Software as supplied.
This permission does not extend to claims infringed only by your changes or
combinations with other products.

No rights are granted beyond those expressly stated here. The Licensors may
offer their Software under separate licenses. Contributors retain their
copyrights; this license is not a copyright assignment and does not by itself
authorize the maintainer to grant broader commercial rights in contributions.
Any such rights must come from the relevant rights holders or a separate
contributor agreement.

7. Third-party components and earlier licenses

Dependencies, vendored code, adapted third-party code, assets, fonts, models,
and other materials identified as separately licensed remain governed by their
respective licenses. See THIRD_PARTY_NOTICES.md and the notices accompanying
those materials. This license cannot restrict rights independently granted
to you in those components under their original licenses.

This license applies to versions and materials offered under it. It does not
withdraw rights already granted for earlier versions or materials under
Apache-2.0 or another license. If you have an independently valid license for
particular materials, you may exercise those rights under that license.
Future revisions of this license do not automatically replace this version
for a copy you already received.

8. Compliance and termination

Permissions under this license last while you meet its conditions. A violation
terminates your permissions for the covered Software. For a first violation,
permissions are restored if you end the violation and remedy its effects to
the extent practicable within 30 days after receiving written notice from a
Licensor. A subsequent violation requires that Licensor's written consent for
reinstatement. Reinstatement does not excuse liability for the violation.

Nothing here limits statutory exceptions or other rights that do not require
the Licensors' permission, or revokes the Content permissions already validly
granted under section 4 for Content created while you complied with this
license.

9. Warranty and liability

To the maximum extent allowed by applicable law, the Software is supplied
without warranties, whether express, implied, or statutory, including
warranties of fitness for a particular purpose, merchantability, title, and
noninfringement. You bear the risk of using it.

To the maximum extent allowed by applicable law, no Licensor is liable for
losses arising from this license or the Software, including lost revenue,
lost data, business interruption, or other direct, indirect, incidental,
special, or consequential damages, regardless of the legal basis of the claim
and even if the possibility of such losses was known.

10. Interpretation

If a provision cannot be enforced, the remaining provisions continue to apply
to the extent permitted by law. Failure to enforce a condition is not a waiver.
Separate written licenses govern only the rights and uses they expressly grant.
```

## 原始第三方声明全文

以下为分叉时的原始清单，路径按原仓库解释；实际打包依赖的许可另由构建自动收集到编辑器产物。

```text
# 第三方声明

BaoCut 的原创材料采用 [BaoCut Community License 1.0](LICENSE)。下列第三方代码与资源保留各自原始许可；本项目许可不改变这些组件已经授予的权利。

BaoCut 的部分代码与资源移植、改写或复制自下列开源项目。代码文件开头的注释写明了来源文件与改动；复制的资源文件列在各节里。

## 文件预览

- PDF.js（Mozilla，`pdfjs-dist`，Apache-2.0）：PDF Worker、渲染器、CMap、标准字体与图片解码器；字体、CMap 和解码器保留各自的许可。
- file-type（MIT）及其依赖：文件内容前缀识别，不依赖文件扩展名。
- DOMPurify（Cure53，Apache-2.0 OR MPL-2.0）：静态 HTML 预览的内容清理。

构建从安装包原文收集这些声明，随 Electron 与 Web 输出到 `assets/file-preview-licenses.txt`（`tools/pdf-licenses.ts`）。

## 幻灯片编辑器

编辑器页面与 `slides_check` 用的编译器（`apps/slides-editor`）打进了 React、Base UI、Floating UI、TanStack Virtual、class-variance-authority（Apache-2.0）、clsx、tailwind-merge、JSZip（MIT/GPL-3.0 双许可，取 MIT）及其内联的 pako（MIT 与 Zlib）等 npm 包。构建按实际打进的模块从安装包原文收集许可，输出到 `third-party-licenses.txt`（页面）与 `node/third-party-licenses.txt`（编译器），随应用的 `slides-editor/` 资源分发（`apps/slides-editor/licenses.mjs`）。

- PptxGenJS 3.12.0（Brent Ely，MIT）：构建时按 `packages/slides-runtime/patches/pptxgenjs-3.12.0.json` 加了 25 处扩展（渐变、平铺填充、图片圆角、占位符继承、自定义主题与母版等），不改安装包。
- mediabunny 1.27.3（Vanilagy and contributors，MPL-2.0）：`packages/slides-runtime/src/media/video-worker.ts` 以字符串原样内嵌它的编译产物，作为重新编码超大视频的 Worker；各段保留原有的 MPL 许可头。完整源码见 https://github.com/Vanilagy/mediabunny，许可全文在 `packages/slides-runtime/licenses/MPL-2.0.txt`，也写进上面两份许可文件。

## 设计稿编辑器

编辑器页面（`apps/design-editor`）打进了 React 19、Base UI、Floating UI、TanStack Virtual、class-variance-authority（Apache-2.0）、clsx、tailwind-merge、reselect、usehooks-ts 等 npm 包。构建按实际打进的模块与内嵌文件从安装包原文收集许可，输出到 `third-party-licenses.txt`，随应用的 `design-editor/` 资源分发（`apps/design-editor/licenses.mjs`）。

- React 18.3.1 与 ReactDOM 18.3.1（Meta，MIT）：画板运行时 `artifact-type/dc-runtime.js` 打进了它们，与编辑器界面的 React 19 分开；两者的 `umd/*.production.min.js` 原样内嵌在页面里，导出画板时与 `support.js` 一起写进导出文件（`vendor/react.js`、`vendor/react-dom.js`）。
- Babel standalone 7.29.0（MIT）：npm 包里的 `babel.min.js` 原样随编辑器分发为 `artifact-type/babel.min.js`，画板 x-import 了 JSX 时才加载，在浏览器里编译 JSX；整份设计稿的 HTML 导出只在用到时内嵌一份。
- dom-to-svg 0.12.2（MIT）及其依赖 postcss、postcss-value-parser、gradient-parser、nanoid、picocolors：注入画板、把画板截成 SVG 的脚本。
- happy-dom 20.9.0（MIT）、jQuery 4.0.0（MIT）及其依赖 entities（BSD-2-Clause）、whatwg-mimetype：快速编辑的 Worker `artifact-type/fast-edit-worker.js`。

## 设计系统编辑器

编辑器页面（`apps/design-system-editor`）打进了 React 19、Base UI、Floating UI、TanStack Virtual、class-variance-authority（Apache-2.0）、clsx、tailwind-merge、reselect、use-sync-external-store 等 npm 包。构建按实际打进的模块与随页面提供的文件从安装包原文收集许可，输出到 `third-party-licenses.txt`，随应用的 `design-system-editor/` 资源分发（`apps/design-system-editor/licenses.mjs`）。

- React 18.3.1 与 ReactDOM 18.3.1（Meta，MIT）：两者的 `umd/*.production.min.js` 原样放在页面的 `artifact-type/vendor/` 下，组件预览按需加载，与编辑器界面的 React 19 分开。

## Paseo

- 来源：Paseo（https://github.com/getpaseo/paseo）
- Copyright (c) 2025-present Mohamed Boudra
- 许可：Apache License, Version 2.0（全文见下）

移植或改写了其中部分机制的 BaoCut 文件（相对原作有修改，修改内容见各文件开头的注释）：

- `packages/agent-drivers/src/acp/acp-connection.ts`
- `packages/agent-drivers/src/acp/acp-driver.ts`
- `packages/agent-drivers/src/acp/acp-items.ts`
- `packages/agent-drivers/src/acp/acp-presets.ts`
- `packages/agent-drivers/src/acp/acp-session.ts`
- `packages/agent-drivers/src/claude/claude-binary.ts`
- `packages/agent-drivers/src/claude/claude-models.ts`
- `packages/agent-drivers/src/claude/claude-query.ts`
- `packages/agent-drivers/src/claude/claude-session.ts`
- `packages/agent-drivers/src/codex/codex-models.ts`
- `packages/agent-drivers/src/codex/codex-session.ts`
- `packages/agent-drivers/src/opencode/opencode-binary.ts`
- `packages/agent-drivers/src/opencode/opencode-driver.ts`
- `packages/agent-drivers/src/opencode/opencode-items.ts`
- `packages/agent-drivers/src/opencode/opencode-models.ts`
- `packages/agent-drivers/src/opencode/opencode-preset.ts`
- `packages/agent-drivers/src/opencode/opencode-server.ts`
- `packages/agent-drivers/src/opencode/opencode-session.ts`
- `packages/agent-drivers/src/pi/pi-driver.ts`
- `packages/agent-drivers/src/pi/pi-items.ts`
- `packages/agent-drivers/src/pi/pi-models.ts`
- `packages/agent-drivers/src/pi/pi-rpc-process.ts`
- `packages/agent-drivers/src/pi/pi-session.ts`
- `packages/ui/src/model/composer-completions.ts`
- `packages/ui/src/model/message-queue.ts`
- `packages/ui/src/runtime/message-queue-runner.ts`

### Apache License, Version 2.0

```text
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

## speech-swift

- 来源：[speech-swift](https://github.com/soniqo/speech-swift)（soniqo；原始版权声明为 `Copyright 2025 Ivan Digital`）
- 许可：Apache License, Version 2.0；[上游 LICENSE 的原文副本](crates/model-runtime/licenses/speech-swift.txt)保留完整条款、版权与免责声明。

BaoCut 的 Qwen3-ASR、Whisper、强制对齐、Silero VAD、Qwen3-TTS、VoxCPM2、OmniVoice、IndexTTS2，以及 HTDemucs 人声分离的部分实现参考或改写自该项目（部分先移植到 BaoCut v2，再移入当前项目）。相关 Swift 实现已改写为 Rust，并适配 BaoCut 的 MLX / candle 张量后端、按清单读取的模型包、错误与任务接口；推理与前后处理另按模型官方实现校正。每个相关实现文件开头保留版权、来源文件与修改声明，原有模型上游的来源说明同时保留。ASR 文件注明参考关系：算法以 Rust 实现，MLX 与 candle 后端有本项目自己的适配；Whisper 仍保留其 BaoCut 早先 Swift 实现的来源说明。

下列文件包含参考或改写部分；表格区分两种关系，不表示整份文件均来自 speech-swift，也不包含仅使用相同模型或框架的代码。模型权重、词典和音色录音的许可独立于本项目的代码许可，仍按各自来源声明。

| BaoCut 文件（相对仓库根） | speech-swift 来源文件（相对上游根） | 使用方式 |
| --- | --- | --- |
| `crates/model-runtime/src/backend/candle/aligner.rs` | `Sources/Qwen3ASR/ForcedAligner.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/backend/candle/audio_encoder.rs` | `Sources/Qwen3ASR/AudioEncoder.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/backend/candle/layers.rs` | `Sources/Qwen3ASR/QuantizedTextDecoder.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/backend/candle/qwen3.rs` | `Sources/Qwen3ASR/Qwen3ASR.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/backend/candle/silero.rs` | `Sources/SpeechVAD/SileroModel.swift / Sources/SpeechVAD/SileroVAD.swift / Sources/SpeechVAD/SileroWeightLoading.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/backend/candle/text_decoder.rs` | `Sources/Qwen3ASR/QuantizedTextDecoder.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/backend/candle/weights.rs` | `Sources/Qwen3ASR/WeightLoading.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/backend/coreml/whisper.rs` | `Sources/WhisperASR/WhisperCoreMLRuntime.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/backend/mlx/aligner.rs` | `Sources/Qwen3ASR/ForcedAligner.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/backend/mlx/qwen3/audio_encoder.rs` | `Sources/Qwen3ASR/AudioEncoder.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/backend/mlx/qwen3/layers.rs` | `Sources/Qwen3ASR/QuantizedTextDecoder.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/backend/mlx/qwen3/model.rs` | `Sources/Qwen3ASR/Qwen3ASR.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/backend/mlx/qwen3/text_decoder.rs` | `Sources/Qwen3ASR/QuantizedTextDecoder.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/backend/mlx/qwen3/weights.rs` | `Sources/Qwen3ASR/WeightLoading.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/backend/mlx/silero.rs` | `Sources/SpeechVAD/SileroModel.swift / Sources/SpeechVAD/SileroVAD.swift / Sources/SpeechVAD/SileroWeightLoading.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/separate/config.rs` | `Sources/SourceSeparation/HTDemucs/HTDemucsConfig.swift` | 移植改写 |
| `crates/model-runtime/src/separate/htdemucs/layers.rs` | `Sources/SourceSeparation/HTDemucs/HTDemucsLayers.swift` | 移植改写 |
| `crates/model-runtime/src/separate/htdemucs/model.rs` | `Sources/SourceSeparation/HTDemucs/HTDemucs.swift` | 移植改写 |
| `crates/model-runtime/src/separate/htdemucs/separator.rs` | `Sources/SourceSeparation/HTDemucs/HTDemucsSeparator.swift` | 移植改写 |
| `crates/model-runtime/src/separate/htdemucs/transformer.rs` | `Sources/SourceSeparation/HTDemucs/HTDemucsTransformer.swift` | 移植改写 |
| `crates/model-runtime/src/separate/segment.rs` | `Sources/SourceSeparation/HTDemucs/HTDemucsSeparator.swift` | 移植改写 |
| `crates/model-runtime/src/separate/stft.rs` | `Sources/SourceSeparation/HTDemucs/HTDemucsSpec.swift` | 移植改写 |
| `crates/model-runtime/src/speech/align_common.rs` | `Sources/Qwen3ASR/ForcedAligner.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/speech/decoding.rs` | `Sources/Qwen3ASR/Qwen3ASR.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/speech/mel.rs` | `Sources/Qwen3ASR/AudioPreprocessing.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/speech/qwen3_asr.rs` | `Sources/Qwen3ASR/Configuration.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/speech/text_prep.rs` | `Sources/Qwen3ASR/TextPreprocessing.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/speech/timestamp.rs` | `Sources/Qwen3ASR/TimestampCorrection.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/speech/tokenizer.rs` | `Sources/AudioCommon/Tokenizer.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/speech/whisper_decoding.rs` | `Sources/WhisperASR/WhisperGenerationConfig.swift / Sources/WhisperASR/WhisperByteLevelTokenizer.swift` | 参考实现，Rust 重写 |
| `crates/model-runtime/src/synthesize/index_tts2/config.rs` | `Sources/IndexTTS2TTS/IndexTTS2RuntimeConfig.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/index_tts2/dsp.rs` | `Sources/SpeechRestoration/SeamlessM4TFrontEnd.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/index_tts2/mlx/bigvgan.rs` | `Sources/IndexTTS2TTS/IndexTTS2BigVGAN.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/index_tts2/mlx/campplus.rs` | `Sources/ChatterboxTTS/CAMPPlus.swift / Sources/IndexTTS2TTS/IndexTTS2CAMPPlusAdapter.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/index_tts2/mlx/engine_impl.rs` | `Sources/IndexTTS2TTS/IndexTTS2NativeRuntime.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/index_tts2/mlx/gpt.rs` | `Sources/IndexTTS2TTS/IndexTTS2SemanticGPT.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/index_tts2/mlx/layers.rs` | `Sources/IndexTTS2TTS/IndexTTS2SemanticGPT.swift / Sources/IndexTTS2TTS/IndexTTS2BigVGAN.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/index_tts2/mlx/s2mel.rs` | `Sources/IndexTTS2TTS/IndexTTS2S2Mel.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/index_tts2/mlx/semantic_codec.rs` | `Sources/IndexTTS2TTS/IndexTTS2SemanticCodec.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/index_tts2/mlx/w2v_bert.rs` | `Sources/IndexTTS2TTS/IndexTTS2Wav2Vec2Bert.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/index_tts2/mlx/weights.rs` | `Sources/MLXCommon/WeightLoading.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/index_tts2/normalizer.rs` | `Sources/IndexTTS2TTS/IndexTTS2TextNormalizer.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/index_tts2/sampling.rs` | `Sources/IndexTTS2TTS/IndexTTS2SemanticGPT.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/index_tts2/segmenter.rs` | `Sources/IndexTTS2TTS/IndexTTS2TextSegmenter.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/index_tts2/sentencepiece.rs` | `Sources/AudioCommon/SentencePieceModel.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/index_tts2/tokenizer.rs` | `Sources/IndexTTS2TTS/IndexTTS2Tokenizer.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/omnivoice/backbone.rs` | `Sources/OmniVoiceTTS/OmniVoiceBackbone.swift / Sources/OmniVoiceTTS/OmniVoiceDiffusion.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/omnivoice/codec.rs` | `Sources/OmniVoiceTTS/OmniVoiceCodec.swift / Sources/OmniVoiceTTS/OmniVoiceCodecEncoder.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/omnivoice/config.rs` | `Sources/OmniVoiceTTS/Configuration.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/omnivoice/engine.rs` | `Sources/OmniVoiceTTS/OmniVoiceModel.swift / Sources/OmniVoiceTTS/OmniVoiceTTSModel.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/qwen3_tts/code_predictor.rs` | `Sources/Qwen3TTS/CodePredictor.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/qwen3_tts/codec_decoder.rs` | `Sources/Qwen3TTS/SpeechTokenizerDecoder.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/qwen3_tts/codec_encoder.rs` | `Sources/Qwen3TTS/SpeechTokenizerEncoder.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/qwen3_tts/config.rs` | `Sources/Qwen3TTS/Configuration.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/qwen3_tts/engine.rs` | `Sources/Qwen3TTS/Qwen3TTS.swift / Sources/Qwen3TTS/Qwen3TTS+ICL.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/qwen3_tts/layers.rs` | `Sources/Qwen3TTS/Talker.swift / Sources/Qwen3TTS/CodePredictor.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/qwen3_tts/mel.rs` | `Sources/Qwen3TTS/SpeakerEncoder.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/qwen3_tts/prompt.rs` | `Sources/Qwen3TTS/Qwen3TTS.swift / Sources/Qwen3TTS/Qwen3TTS+ICL.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/qwen3_tts/sampling.rs` | `Sources/Qwen3TTS/Sampling.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/qwen3_tts/speaker_encoder.rs` | `Sources/Qwen3TTS/SpeakerEncoder.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/qwen3_tts/talker.rs` | `Sources/Qwen3TTS/Talker.swift / Sources/Qwen3TTS/CodePredictor.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/qwen3_tts/tokens.rs` | `Sources/Qwen3TTS/Configuration.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/qwen3_tts/weights.rs` | `Sources/Qwen3TTS/TTSWeightLoading.swift / Sources/Qwen3TTS/TTSWeightLoading+Encoder.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/voxcpm2/audio_vae.rs` | `Sources/VoxCPM2TTS/AudioVAE.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/voxcpm2/config.rs` | `Sources/VoxCPM2TTS/Configuration.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/voxcpm2/engine.rs` | `Sources/VoxCPM2TTS/VoxCPM2TTS.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/voxcpm2/minicpm.rs` | `Sources/VoxCPM2TTS/MiniCPM4.swift / Sources/VoxCPM2TTS/VoxCPM2TTS.swift` | 移植改写 |
| `crates/model-runtime/src/synthesize/voxcpm2/tokenizer.rs` | `Sources/VoxCPM2TTS/VoxCPM2TTS.swift` | 移植改写 |

TTS 与人声分离模块的 `mod.rs` 另汇总来源与修改范围。上游许可副本与来源路径按 speech-swift `1f54e56cf137078ed681a03e0955e777f7314610` 核对；该版本号用于定位声明来源，不表示当前实现与该版本完全相同。

本声明和上游许可副本随桌面与 Web 构建分发；桌面安装包在 `resources/THIRD_PARTY_NOTICES.md` 与 `resources/crates/model-runtime/licenses/speech-swift.txt` 保留可直接读取的副本。

## lobe-icons

- 来源：lobe-icons（https://github.com/lobehub/lobe-icons）
- Copyright (c) 2023 LobeHub
- 许可：MIT License（全文见下）

原样复制的服务商图标（未修改内容，只按服务商 id 改了文件名；每个文件里的 `<title>` 与 `style="flex:none;line-height:1"` 是它的原样标记）：

- `designs/baocut/assets/vendors/anthropic.svg`
- `designs/baocut/assets/vendors/codex.svg`（原名 `codex-color.svg`）
- `designs/baocut/assets/vendors/cursor.svg`
- `designs/baocut/assets/vendors/deepseek.svg`（原名 `deepseek-color.svg`）
- `designs/baocut/assets/vendors/elevenlabs.svg`
- `designs/baocut/assets/vendors/githubcopilot.svg`
- `designs/baocut/assets/vendors/google.svg`（原名 `gemini-color.svg`）
- `designs/baocut/assets/vendors/groq.svg`
- `designs/baocut/assets/vendors/minimax.svg`（原名 `minimax-color.svg`）
- `designs/baocut/assets/vendors/mistral.svg`（原名 `mistral-color.svg`）
- `designs/baocut/assets/vendors/moonshot.svg`（原名 `kimi.svg`）
- `designs/baocut/assets/vendors/openai.svg`
- `designs/baocut/assets/vendors/opencode.svg`
- `designs/baocut/assets/vendors/openrouter.svg`
- `designs/baocut/assets/vendors/pi.svg`
- `designs/baocut/assets/vendors/qwen.svg`（原名 `qwen-color.svg`）
- `designs/baocut/assets/vendors/siliconflow.svg`（原名 `siliconcloud-color.svg`）
- `designs/baocut/assets/vendors/volcengine.svg`（原名 `volcengine-color.svg`）
- `designs/baocut/assets/vendors/xai.svg`
- `designs/baocut/assets/vendors/zhipu.svg`（原名 `zhipu-color.svg`）

`packages/ui/src/components/vendor-icons/` 下是上面其中 9 个文件的逐字节副本（应用里 Agent 选择器的图标；`designs/baocut/app/icon-sync.test.js` 核对两份一致）：

- `packages/ui/src/components/vendor-icons/anthropic.svg`
- `packages/ui/src/components/vendor-icons/codex.svg`
- `packages/ui/src/components/vendor-icons/cursor.svg`
- `packages/ui/src/components/vendor-icons/githubcopilot.svg`
- `packages/ui/src/components/vendor-icons/google.svg`
- `packages/ui/src/components/vendor-icons/moonshot.svg`
- `packages/ui/src/components/vendor-icons/opencode.svg`
- `packages/ui/src/components/vendor-icons/pi.svg`
- `packages/ui/src/components/vendor-icons/xai.svg`

这些图标中的名称与标志是各自所有者的商标，只用于标明 BaoCut 连接的是哪家服务，不表示所有者认可或赞助 BaoCut。

### MIT License

```text
MIT License

Copyright (c) 2023 LobeHub

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Spectrum 2 图标

- 来源：Adobe React Spectrum（https://github.com/adobe/react-spectrum），`@react-spectrum/s2` 的 workflow 图标
- 许可：Apache License, Version 2.0（全文见上文「Paseo」一节）

外壳图标 `designs/baocut/assets/shell/*.svg`（`packages/ui/src/components/shell-icons/` 是逐字节相同的一份）里：`summary.svg` 是 S2 `ListBulleted` 的路径，未改；`sidebar.svg`、`sidebar-hidden.svg`、`tabs.svg`、`hide-tabs.svg` 用 S2 展开面板图标（expand right）的方框与面板条，`sidebar.svg` 把面板条加宽到 4，`hide-tabs.svg` 加一条中线；`full.svg`、`exit-full.svg`、`tabs-plus.svg` 是 BaoCut 按 S2 画法自绘。逐个来源见原型同目录的 `provenance.json`。

这组外壳图标的选型（侧栏开关、标签页、完整视图、会话摘要）与完整视图两角的比例（臂长、跨度、两角间距）参考了 OpenAI Codex 桌面应用 26.930.61225 的外壳图标；图形按 S2 画法重画，没有复制它的路径数据。OpenAI 与 Codex 是其所有者的商标，参考不表示所有者认可或赞助 BaoCut。

## HyperFrames

- 来源：HyperFrames（https://github.com/hyperframes/hyperframes）
- 许可：Apache License, Version 2.0（全文见上文「Paseo」一节）

BaoCut 实现了 HyperFrames 公开的作者合同（合同标识 `hyperframes/1`）：根元素的 `data-*` 属性（`data-composition-id`、`data-width`、`data-height`、`data-fps`、`data-duration`）与 `window.__timelines[id].seek`，用来验证、取帧和烘焙按这个合同写的代码包（[代码包规范 §4.7](docs/spec/code-bundle-spec.md#47-hyperframes)）。BaoCut 没有移植、改写或复制 HyperFrames 的代码或资源，也不随应用分发它；本节只说明这个合同的出处。

## smol-toml

历史版本配置的 TOML 解析使用 smol-toml（Squirrel Chat，BSD-3-Clause）。随 Runtime 构建分发，原始许可如下：

```text
Copyright (c) Squirrel Chat et al., All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors
   may be used to endorse or promote products derived from this software without
   specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

## keyring

Windows Credential Manager 的读写使用 keyring（keyring Developers），本分发选择 MIT 许可：

```text
Copyright (c) 2016 keyring Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
```

## YuNet 人脸检测模型

`packages/models/assets/face-detection/yunet-2023mar.onnx` 是 OpenCV Zoo 的 YuNet 模型（`face_detection_yunet_2023mar.onnx`，内容未改动，只改了文件名），随应用分发，`videos_frames` 用它标出每帧的人脸框。来源（固定到提交）、SHA-256 与许可原文见同目录的 `COPYING.txt`。

- 来源：https://github.com/opencv/opencv_zoo/tree/f12e12798e8314f7c074a6656816c048dcc95b7a/models/face_detection_yunet
- 许可：MIT License，Copyright (c) 2020 Shiqi Yu

## tract

人脸检测进程 `face-detect`（`crates/face-detect`）用 tract（Sonos，`tract-onnx` 及其依赖的 `tract-*` crate）做纯 Rust 的 ONNX 推理，编进随应用分发的原生程序。tract 以 MIT OR Apache-2.0 双许可发布，本分发选择 MIT 许可：

```text
Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
```
```

## 分叉时运行时的来源与重建限制

以下为历史原文，用于追踪重建质量与许可限制；其中旧命令和目录不是当前操作入口，当前路由见 ARCHITECTURE.md。

````text
## 分叉时的 design-runtime 来源与已知限制

# design-runtime

设计稿（画布）编辑器的运行时：画布与画板、属性编辑、预览文档的构建、画板运行时、注入脚本、快速编辑 Worker 与导出。源码按 1:1 移植自 Claude Design 类型的 TypeScript 重建（`src/design-type`），文件格式（`canvas.json` v3、`*.dc.html`、`support.js` / `dc-runtime.js`、快速编辑 Worker、`/_blob/<id>` 素材）、界面、行为与模块结构都不改，只改 BaoCut 托管必需的部分，改动处带 `BaoCut:` 注释（见下）。`apps/design-editor` 把它打成编辑器页面，宿主能力由 `packages/design` 的 shim 提供。用户可见的行为见[产品设计 §3.3](../../docs/product/product-design.md#33-功能区ux-07)。

## 结构

模块两阶段安装：每个模块导出 `install<名字>(runtime)`，先登记函数与可变绑定，返回的初始化函数再按固定顺序执行；模块之间只经 `runtime.<名字>` 互相访问。安装顺序在 `app-runtime.ts`，`createDesignRuntime()` 装完模块后挂界面。

类型：保留原工程的 `Dynamic`（即 `any`），不给整个代码库补类型。根 `tsconfig.json` 一次检查所有包，所以不加全局或 `react` 的类型增补：原工程的 `react-css.d.ts`（给 `CSSProperties` 加 `--变量`）没有搬过来，运行时里的内联样式本来就是 `Dynamic`，不需要它。`env.d.ts` 是 BaoCut 加的，引入 `vite/client` 给 `?raw` 导入用（原工程写在自己的 tsconfig 里）。`application/design-bootstrap.tsx` 有一处 `@ts-expect-error`：TS 把原表达式 `x ?? null` 判为恒为空（TS2871），表达式照原样保留。

| 路径 | 内容 |
| --- | --- |
| `app-runtime.ts`、`dependencies.tsx`、`module-helpers.ts` | 入口与安装顺序；npm 依赖与 `generated/` 脚本文本的登记；CommonJS / ESM 互操作 |
| `runtime-types.ts`、`runtime-contracts.ts`、`ui-runtime-contracts.ts`、`types.ts`、`globals.d.ts`、`contracts/` | 绑定表与各模块之间的协议类型；页面全局 |
| `application/`、`bootstrap/` | 启动、设计稿根节点与封面；跟随系统明暗 |
| `canvas/`、`editor/`、`properties/`、`geometry/`、`find/` | 画布、画板、选择、侧栏、属性面板、吸附与变换、查找 |
| `preview/`、`scripts/` | 画板的预览文档（依赖图、模块缓存、CSS 与素材改写）；注入画板的脚本（预览桥、存储、XHR / fetch、截图、属性拖动等） |
| `runtime/` | 画板运行时，打成 `dc-runtime.js` 与导出文件用的 `support.js`（React 18；Babel 按需加载，不打进去） |
| `fast-edit/`、`worker/` | 快速编辑：控制器、草稿、日志；happy-dom Worker（`fast-edit-worker.js`） |
| `platform/` | 宿主能力、文件读写与发布、外部改动、frame 协议、权限、上报（已关） |
| `comments/`、`collaboration/` | 标注锚点与区域；多人在线的光标与选择（单用户下不出现） |
| `design-system/` | 设计稿引用的设计系统：已装列表、tokens 与字体解析 |
| `export/`、`assets/`、`thumbnail/` | HTML / PDF / 图片 / 压缩包导出；图片放置；缩略图 |
| `cds/` | 原平台的组件库（主题、弹层、表单、图标） |
| `app.css` | 编辑器界面的样式（含内联的图标字体） |
| `generated/` | 构建产物，不进 git：`apps/design-editor/build.mjs` 用 esbuild 打出的脚本文本，`dependencies.tsx` 以 `?raw` 导入 |
| `tools/worker-browser-plugin.mjs` | 打 Worker 时把 Node 内置模块换成浏览器适配（原工程的同名插件） |

## 宿主与平台

代码里以 `BaoCut:` 注释标出，页面模板 `apps/design-editor/index.html` 的改动写在它开头的注释里。

- **宿主接口**：运行时从 `globalThis.designHost` 读宿主能力，原运行时读 `globalThis.claude`，每个读取点与提到它的报错文案都改了。宿主对象由 `packages/design/src/editor` 的 `installDesignEditorHost()` 装上，复用 `@baocut/slides/editor` 的 `connectEditorHost`；提供哪些能力、缺的能力运行时怎么兜底，见 `packages/design/src/editor/design-host.ts`。
- **功能开关固定**：页面模板装固定取值的 `__appifact_flags`，不向宿主要；快速编辑关（不提供 `sample`），跨画布粘贴前确认开，其余是运行时读开关时的默认值。不装健康上报 `__appifact_health`。
- **能力声明**：页面的 `appifact-capabilities` 去掉 `room`、`sample`、`flags`；运行时只读其中的 `db` 与 `downloads`。
- **不信任外部来源**：父窗口的 origin 白名单为空（`platform/design-source.tsx`、`platform/frame-host-bridge.tsx`）；frame 协议另认 `__FRAME_PREAMBLE.trustParent`，只信任 `window.parent` 本身、回消息用 `"*"`（桌面端父页面是 `file://`，origin 为 `null`），由 `packages/design` 的 shim 在 BaoCut 的 iframe 里声明，BaoCut 借此驱动整份导出（[产品设计 §3.3](../../docs/product/product-design.md#33-功能区ux-07)）；链接不放行原平台的应用 scheme、编辑器扩展与网域（`cds/links.tsx`），设计系统不从托管地址安装（`design-system/install-identifiers.ts`）；桌面端按 Electron 判断（`cds/platform/runtime.ts`）。
- **不上报**：没有使用分析（`platform/health-and-analytics.ts`）。
- **字体**：不内置品牌字体，Anthropic Sans 退回系统字体（`app.css`），页面不从 `/_runtime/` 预载字体。
- **文案**：界面里称智能体为「the agent」。
- **页面模板**：不带写给托管平台的 README 注释与 meta、`mega-build-stamp`。
- **Babel 的来源**：画板 x-import 了 JSX 时运行时才加载 Babel standalone，原版从 CDN 取，编辑器的 CSP 不放行 CDN。预览文档用 `window.__resources` 把 CDN 地址映射到编辑器自带的 `artifact-type/babel.min.js`（页面 meta `dc-babel-file`，`preview/runtime-loading.ts` 的 `getBabelFileUrl`、`preview/build-document.ts`）；整份 HTML 导出要内嵌 Babel 时也从这份取（`export/asset-resolver.ts`），与 CDN 上的文件逐字节相同，过得了导出的完整性校验。
- **导出体积上限**：运行时交给宿主的单个导出文件原版最多 16 MB，BaoCut 改为 256 MB，与一份设计稿的文件总量上限相同（`export/downloads.tsx`；保存桥另限 512 MB），超限提示里的数字跟着上限走（`export/html-producer.ts`、`canvas/design-canvas.tsx`）。

从 `src/design-type` 原样继承、与线上原页面不同的一点：

- 画板运行时的 React 18.3.1 用 npm 别名 `react-18` / `react-dom-18`（声明在 `apps/design-editor/package.json`）：`dc-runtime.js` 打进它们的 CommonJS 版本，两份 UMD 文件原样内嵌在页面里，导出时写成 `vendor/react.js`、`vendor/react-dom.js`。编辑器界面用工作区的 React 19，两者不混用。

## 重建代码的修正

重建代码里有几处从压缩代码还原时绑错的标识符，与原脚本对照后改回，带 `BaoCut: restorer fix` 注释：

- `scripts/preview-viewport.ts`：调用保存下来的原生 `focus`（原脚本 `native.call`），重建代码调用了包装函数自己，聚焦画板里的元素时无限递归。
- `scripts/preview-storage.ts`：读作用域内的存储 `n`（原脚本 `real`），重建代码读成了循环上限的 `length.length` / `length.key`，列出画板存储的键时报错。
- `scripts/preview-xhr.ts`：按请求的 `responseType`（原脚本 `rt`）分支，重建代码判断的是响应文本，arraybuffer / blob / json / document 都按文本返回，6 处。
- `fast-edit/element-targets.ts`：点击位置用外层的 `x`（`click.x`），重建代码拿元素条目和矩形比，画板子元素横向永远命中不了。

另有两处不是绑错，带 `BaoCut: restored from the shipped dc-runtime` 注释。`runtime/boot.ts` 的 `ensureReactAvailable` 在重建代码里是空函数（理由是 React 从 npm 打进来了）。编辑器里的预览与 `dc-runtime.js` 确实自带 React，但导出的整份 HTML 把 React 按 CDN 地址内嵌在 `window.__resources` 里，只有这个函数去找，画板因此白屏。按线上原版改回：页面上已有 React 就跳过，否则经 `resolveScriptResource` 找到内嵌的那份加载。

`runtime/resources.tsx` 的 `ensureBabel` 同样按线上原版改回：重建代码把 npm 的 `@babel/standalone` 7.29.0 打进画板运行时（`dc-runtime.js` 约 7.2 MB、`support.js` 约 6.1 MB，导出的整份 HTML 每个画板各带一份，约 7 个画板就超出 16 MB），原版只在 x-import 了 JSX 时才加载：页面上已有 Babel 就跳过，否则经 `resolveScriptResource` 找到映射的那份（没有映射就用 CDN 地址）。改回后 `dc-runtime.js` 约 1.2 MB、`support.js` 约 0.1 MB，Babel 另成 `artifact-type/babel.min.js`（约 3.1 MB），整份 HTML 导出只在有画板 x-import 了 JSX 时内嵌一份。

查法：用 `noUnusedLocals` 找没用上的局部变量（丢失的绑定常留下一个），再用 Babel 把线上原页面的 `app.js` 与我们的打包结果逐函数做结构指纹（局部变量按出现顺序编号，自由变量折成一类），找「结构相同、只有绑定不同」的函数对。主页面原有 20463 个函数，19111 个完全对上；剩下只差绑定的都落在依赖里（Base UI、ReactDOM 的版本与线上不同），注入脚本、`dc-runtime.js` 与 Worker 的差别只是打包方式。1019 个结构有差别的最内层函数没有逐个审，`scripts/property-scrubber.ts` 的内部属性名被重建改过名，两处都是残余风险。

## 随包的第三方代码与资源

- 打进页面、画板运行时、注入脚本与 Worker 的 npm 包（含 React 18、happy-dom、jQuery、dom-to-svg）与原样随附的 Babel standalone 按实际打进的模块收集许可，见根目录 [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md)「设计稿编辑器」与 `apps/design-editor/licenses.mjs`。
- `app.css` 内联的图标字体（Anthropicons）随原样式搬来，不是仓库约定的 S2 图标（[仓库约定 §4](../../docs/repo-conventions.md#4-界面图标)），以后要换；它的分发许可也待确认。
- 依赖版本跟原工程或工作区对齐：Base UI 1.6.0、`@babel/standalone` 7.29.0 与原工程相同；React 19、TanStack Virtual 用工作区的版本；postcss 是 8.5.28（原工程 8.5.29），截图脚本 `svg-capture.js` 因此与原工程逐字节不同。
- 编辑器会向父窗口发 `__frame_claude_activity_ask`（`platform/claude-activity.tsx`），BaoCut 不处理，无害。

## 验证

```bash
node apps/design-editor/build.mjs --force
```

```bash
npm run typecheck
```

```bash
npx vitest run tools/third-party-notices.test.ts apps/desktop/src/main/packaged-resources.test.ts apps/cli/src/runtime/connection.test.ts
```

改动后在 Web 或桌面端打开一份设计稿，过一遍选择、文字编辑、保存后重新载入、粘贴图片、标注与导出。

## 分叉时的 design-system-runtime 来源与已知限制

# design-system-runtime

设计系统编辑器的运行时：Overview（README 文档）、Colors、Typography、Spacing、Corner radius、Shadows、Border width、Components（组件预览）、Assets、Files 文件表、搜索，以及按 `layout: "files"` 读写设计系统目录的存储层。源码按 1:1 移植自原 Design System 类型的 TypeScript 重建（`src/design-system-type`），磁盘格式（`design-system.json`、`_files.json` 索引、`tokens.json` / `tokens.css`、`components/`、`assets/`、`/_blob/<id>` 素材）、界面、行为与模块结构都不改，只改 BaoCut 托管必需的部分，改动处带 `BaoCut:` 注释（见下）。`apps/design-system-editor` 把它打成编辑器页面，宿主能力由 `packages/design-system/src/editor` 的 shim 提供。

## 结构

模块两阶段安装：每个模块导出 `install<名字>(runtime)`，先用 `bindRuntimeValue` 登记函数与可变绑定，返回的初始化函数再按固定顺序执行；模块之间只经 `runtime.<名字>` 互相访问。安装顺序在 `runtime.ts`，`createDesignSystemRuntime()` 装完模块后由 `bootstrap.tsx` 挂界面。

| 路径 | 内容 |
| --- | --- |
| `runtime.ts`、`bootstrap.tsx`、`dependencies.ts`、`module-helpers.ts` | 入口与安装顺序；挂界面；npm 依赖的登记；CommonJS / ESM 互操作 |
| `runtime-api.ts`、`runtime-types.ts`、`reviewed-runtime-types.ts`、`inferred-runtime-types.ts`、`npm-runtime-types.ts`、`types.ts`、`contracts.ts`、`contracts/`、`reconstruction/` | 绑定表与各模块之间的协议类型（含宿主全局 `ProtocolGlobal`，`contracts/platform-host.ts`） |
| `files/`、`files/ui/` | 按文件存储：启动与读取、索引编解码、懒读、保存队列、外部改动、迁移（旧版单页存储）；应用外壳、导航与搜索、文件表、欢迎页 |
| `editor/` | 各章节的编辑器：色板与对比度、字体、间距与圆角、阴影、组件预览（`run.html` runner、swatch 运行时）、素材组与上传、Markdown 文档、向智能体发请求（`claude-delivery.tsx`、`claude-prompts.ts`）、迁移提示条 |
| `model/` | 设计系统模型：tokens、文件策略与分类、组件推断、文档生成（`documentation.ts`、`remote-text.ts`）、预览用的库目录（`libraries.ts`）、发布 |
| `documents/`、`media/` | 页面文档的存储、自动保存、自发布、写权限；素材上传能力 |
| `host/`、`platform/` | 宿主能力的读取、用户、外部改动（hot reload）、frame 协议（`frame-bridge.tsx`、`frame-chrome.tsx`） |
| `telemetry/` | 健康上报：页面不装 `__appifact_health`，读不到时不报 |
| `ui/` | 原平台的组件库（主题、弹层、表单、菜单、提示、图标） |
| `app.css` | 编辑器界面的样式（含内联的图标字体） |

原工程的 `tests/`、`tools/`、`reconstruction/` 里的笔记与证据、`dist/`、页面模板与 `main.ts` 不搬：页面模板与入口在 `apps/design-system-editor`。

## 类型

这份重建是 strict 的完整类型（不像设计稿运行时那样保留 `Dynamic`），按原工程的编译选项写成，与根 `tsconfig.json` 的选项不兼容（根开 `noUncheckedIndexedAccess`，会报几百处）。所以单独检查：本目录的 `tsconfig.json` 继承根配置，关掉 `noUncheckedIndexedAccess`，像原工程一样引入 `vite/client`（页面入口以副作用导入 `app.css`）与 `node`，连同 `apps/design-system-editor/src` 一起查；根 `tsconfig.json` 排除这两个目录，`npm run typecheck` 依次检查两者。`browser.d.ts` 是原工程的全局声明（`EyeDropper`），只在这份检查里出现。

shim（`packages/design-system/src/editor`）不用 `declare global` 声明 `designSystemHost`：运行时的 `ProtocolGlobal` 已经声明了它（类型是运行时的 `ClaudeBridge`），两份放进同一个检查会冲突。shim 经 `DesignSystemHostWindow` 赋值。

## 宿主与平台

代码里以 `BaoCut:` 注释标出，页面模板 `apps/design-system-editor/index.html` 的改动写在它开头的注释里。

- **宿主接口**：运行时从 `globalThis.designSystemHost` 读宿主能力，原运行时读 `globalThis.claude`。统一入口 `host/claude-capabilities.ts` 之外另有直接读的地方，都改了：`contracts/platform-host.ts`、`contracts/model-core.ts`、`contracts/editor-runtime.ts`、`reviewed-runtime-types.ts`、`host/hot-reload.ts`、`media/assets.ts`、`model/asset-store.ts`、`model/derive-system.ts`、`files/reopen.ts`、`editor/claude-delivery.tsx`（5 处）、`documents/storage.ts`、`documents/self-publish.ts`、`files/debug-panel.ts`；提到它的报错文案也改了。宿主对象由 `installDesignSystemEditorHost()` 装上，复用 `@baocut/slides/editor` 的 `connectEditorHost`；提供哪些能力（`artifact`、`self`、`user`（另给 `name()`）、`assets`，在会话的标签里另有 `chat`）、不提供哪些（`use`、`comments`、`room`、`hot`、`db`、`downloads`、`commentLabels`；运行时本来就不调 `comments`，标注的桥交给 shim 自己的目标层 `comment-targets.ts`），见 `packages/design-system/src/editor/design-system-host.ts`。
- **标注**：原版不画批注层，只在 DOM 上标目标，批注层归宿主；BaoCut 的父窗口跨源读不到 DOM，所以这一层在 shim 里（`packages/design-system/src/editor/comment-targets.ts`）。运行时这边只改两处：`commentTargetProps` 另标原名 `data-comment-name`（`editor/comment-anchors.ts`，类型在 `reviewed-runtime-types.ts`），名字截短加哈希后位置标签仍能写原名；`files/ui/design-system-app.tsx` 监听 `baocut:reveal-comment-target`，跳回一处时与搜索里选中一条走同一条路（`navigationSearch.onPick`），索引里没有那个目标时按给的章节去等它出现。
- **frame 协议**：父窗口的 origin 白名单为空（`host/frame-bridge.tsx` 的 `DEFAULT_HOST_ORIGINS`），编辑器自己画保存状态与只读标记，不把导出、保存、只读交给宿主画。
- **功能开关固定**：页面模板装固定取值的 `__appifact_flags`，不向宿主要；`design_system_clean_up_button` 取原版的 `true`，其余是运行时读开关时的默认值。不装健康上报 `__appifact_health`。
- **能力声明**：页面的 `appifact-capabilities` 去掉 `room`；运行时只读其中的 `db`（判断存储方式）与 `downloads`（是否声明了下载）。
- **不上报**：迁移提示条的使用分析不发（`editor/migration-banners.tsx`，不向父窗口发 `__frame_cap`）。
- **提示词**：原版用页面地址指代这个设计系统（`artifactPageAddress()`）；BaoCut 的页面地址带 grant，对智能体没用，改成页面地址 `path` 参数给的设计系统目录路径（反引号括起，控制字符与反引号换成 `?`；没有时说 “this design system”），函数签名不变（`editor/claude-prompts.ts`）。提到原平台 skill、`artifact-type/` 文件与 Artifact 工具的说法改成 BaoCut 的 skill `design-system`（`SKILL.md` 与 `references/`）与工作目录里的文件：`editor/claude-prompts.ts`（from-code、空系统的 Build from connectors / Sync from GitHub、对比度修复、上传后起草、改 token）、`editor/migration-banners.tsx`（Finish the migration 的清理提示，地址同上，`isArtifactAddress` 改成认反引号括起的路径）、`model/documentation.ts`（素材与字体在 `_blobs/`、消费方怎么引用、写作指引是 skill）、`model/remote-text.ts`（3 处，没有 Artifact 工具）。
- **送达状态**：BaoCut 不提供 `room` 与 `comments.sendToClaude`，「Ask Claude」类请求一律走 `chat.suggestPrompt` 放进会话的输入框，所以 `suggested` 的状态文案改成 “The request is in your chat box — send it to the agent.”（原文是没找到会话的兜底说法）；不在会话里时退回复制，文案不变（`editor/claude-prompts.ts` 的 `claudeDeliveryStatusMessage`）。
- **文案**：界面里称智能体为「the agent」，不称 Claude（欢迎页、空状态、上传、色板、阴影、组件、素材组、保存与启动提示、写权限、迁移等，各处单独标注）。
- **预览用的 React**：组件预览的 React 18.3.1 UMD 不从 jsDelivr 加载，取页面自带的 `artifact-type/vendor/react*.production.min.js`（`model/libraries.ts` 的 `pageVendorUrl`，根相对地址；文件与 jsDelivr 上的同字节，integrity 不变）；`editor/swatch-runtime.tsx` 的 `SWATCH_RUNTIME_TAG_URL_PATTERN` 相应只认这个路径。
- **链接**：不放行原平台的应用 scheme（claude、claude-cli、claude-nest）、编辑器扩展与网域，只跟随 VS Code 设置链接；桌面端按 Electron 判断（`ui/overlays.tsx`）。
- **字体**：不内置 Anthropic Sans，`anthropic` 字体退回系统 UI 字体（`app.css`）。
- **页面模板**：不带写给托管平台的 README 注释与 meta；样式与脚本由 Vite 打进 `assets/`，`artifact-type/` 下只有原样的 `run.html` 与 `vendor/`。

从原工程原样继承、在 BaoCut 里不起作用的部分：

- `editor/swatch-runtime.tsx` 的 `ADMITTED_PREVIEW_CDN_PREFIXES` 仍允许预览引用 jsDelivr 的脚本，但 BaoCut 的 CSP 不放行外部地址，这类预览载不出来。
- `run.html` 里的 `delete window.claude` 原样保留，无害。
- `ui/overlays.tsx` 里拒绝链接时的控制台说明仍提到原平台的应用与扩展；`trustedAnthropicDomains` 为空。
- 字体 token 名 `anthropic`（`contracts/dom.ts`、`contracts/layers.ts`、`ui/foundation.tsx`）与 `app.css` 里的 `--font-anthropic-*` 变量名照旧。
- 迁移（旧版单页存储转成 `layout: "files"`）的代码整套保留，BaoCut 不测试这条路。

## 随包的第三方代码与资源

- 打进页面的 npm 包与预览用的 React 18.3.1 UMD 按实际打进的模块收集许可，见根目录 [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md)「设计系统编辑器」与 `apps/design-system-editor/licenses.mjs`。
- `app.css` 内联的图标字体（Anthropicons）随原样式搬来，不是仓库约定的 S2 图标（[仓库约定 §4](../../docs/repo-conventions.md#4-界面图标)），以后要换；它的分发许可也待确认。
- 依赖版本跟原工程对齐：Base UI 1.6.0、TanStack Virtual 3.14.9 / virtual-core 3.17.7、class-variance-authority 0.7.1、clsx 2.1.1、tailwind-merge 3.6.0；React 19 用工作区的版本。

## 验证

```bash
node apps/design-system-editor/build.mjs --force
```

```bash
npm run typecheck
```

```bash
npx vitest run packages/design-system/src/editor apps/desktop/src/main/packaged-resources.test.ts apps/cli/src/runtime/connection.test.ts tools/third-party-notices.test.ts
```

改动后在 Web 或桌面端打开一份 `layout: "files"` 的设计系统与一份只有 `design-system.json` 的空系统，过一遍 Overview、Colors、Components（预览载出）、Assets（素材缩略图）、编辑后保存再重新载入、只读打开，以及空系统欢迎页的三张卡片（请求进会话的输入框）。
````
