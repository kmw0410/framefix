# GitHub 배포

현재 워크플로는 **GitHub Release 다운로드 파일 배포**를 자동화합니다. Chrome 웹 스토어 게시는 수행하지 않습니다. 실제 YouTube/Premium 계정 검증이 남아 있어 릴리스는 우선 prerelease로 게시합니다.

## 최초 공개 전

1. Chrome에서 일반 영상, 재생목록, 광고 복귀, OFF → 자동 복원, ON → 이전 화질 복원, Premium 옵션을 실제로 확인합니다. 모의 플레이어 테스트 통과만으로 실제 YouTube 호환성이 입증되지는 않습니다.
2. 재사용·수정·재배포를 허용하려면 소유자가 라이선스를 선택해 `LICENSE`를 추가합니다. 현재 라이선스는 선택하지 않았습니다. 소스 공개와 오픈소스 사용 허가는 별개입니다.
3. GitHub에 빈 공개 저장소를 만들고 소스를 push합니다. `node_modules`, `dist`, `release`, `.env` 및 개인 키는 올리지 않습니다. `package-lock.json`과 원본 아이콘/PNG는 올립니다.

이 작업 디렉터리는 아직 Git 저장소가 아닙니다. 원하는 저장소 URL이 정해진 뒤 다음 순서로 시작할 수 있습니다.

```sh
git init -b main
git add .
git commit -m "Initial FrameFix source"
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

## CI

브랜치 push / PR / 수동 실행 때 타입 검사, 단위 테스트, Chromium 팝업·모의 플레이어 테스트, 패키징을 수행합니다. 성공한 패키지는 Actions의 `framefix-packages` artifact에서 받을 수 있습니다. CI에는 배포용 secret이 필요하지 않습니다.

GitHub Actions는 Ubuntu, Node.js 24, Python 3을 사용합니다. 로컬 패키징에도 Python 3이 필요합니다.

```sh
npm ci
npm run check
npx playwright install chromium
npm run test:browser
npm run package
```

## main 자동 릴리스

소스를 `main`에 push하면 검증·빌드·GitHub prerelease 생성까지 자동으로 실행됩니다. 수동 태그 생성이나 package.json 버전 수정은 필요 없습니다.

```sh
git add .
git commit -m "Update FrameFix"
git push origin main
```

`release.yml`은 main push와 main에서의 수동 실행을 지원합니다. 다른 브랜치 push와 PR은 CI만 수행합니다. main은 릴리스 워크플로가 CI를 호출하므로 동일 push에 CI가 중복 실행되지 않습니다.

- 릴리스 태그: 커밋의 UTC 날짜 + 실행 번호, 예: `v26.10.31-42`
- 확장 버전: `2026.10.31.42` (Chrome가 허용하는 숫자 형식)
- 재실행에서는 같은 커밋 날짜와 실행 번호를 사용합니다.
- 빌드 작업 공간에서만 package.json/lockfile 버전을 변경합니다. 저장소로 자동 커밋하지 않습니다.
- 빌드된 manifest, 파일명, 소스 ZIP의 package 버전이 일치합니다.
- 테스트한 커밋 SHA에 GitHub API가 태그를 만들고 릴리스를 게시합니다.

자동 배포 파일:

- `framefix-VERSION-chrome.zip`
- `framefix-VERSION-source.zip`
- `SHA256SUMS.txt`
- `RELEASE-NOTES.md`

GitHub 기본 `GITHUB_TOKEN`을 사용하며 publish job에만 `contents: write`가 부여됩니다. 별도 PAT 또는 WORKFLOW_TOKEN은 필요 없습니다. 저장소/조직 정책에서 Actions의 쓰기가 허용되어야 합니다.

같은 태그의 릴리스가 이미 있으면 재실행 시 그대로 유지합니다. 변경을 배포하려면 main에 새 커밋을 push하거나 main에서 워크플로를 수동 실행하세요. 실제 YouTube/Premium 검증이 남아 있어 현재 prerelease로 게시합니다.

## 추후 Chrome 웹 스토어 자동화

Chrome 웹 스토어 자동 게시는 개발자 등록, 최초 항목 생성, 스토어 설명·이미지·개인정보처리방침 준비 후 별도로 연결합니다. GitHub Release 업로드만으로 스토어 게시나 설치된 확장의 자동 업데이트가 이루어지지는 않습니다.

소스 ZIP에는 필요한 소스, lockfile, README가 포함됩니다. 원본에서 `npm ci && npm run build`로 빌드할 수 있으며 아이콘을 재생성할 필요는 없습니다.

공식 게시 안내: https://developer.chrome.com/docs/webstore/publish

## 로컬 검증

워크플로 문법(actionlint), 타입 검사, 단위 테스트, Chromium UI/모의 플레이어 테스트, 패키지 구조와 자동 버전 생성을 검증합니다. 실제 GitHub Actions 실행은 저장소 push 후 확인해야 합니다.
