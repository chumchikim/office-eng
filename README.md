# The Office English Study App

## 배포 방법 (5분)

### 1. GitHub에 올리기
```bash
cd office-english
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/[내아이디]/office-english.git
git push -u origin main
```

### 2. Vercel에서 배포
1. [vercel.com](https://vercel.com) 접속 → GitHub 로그인
2. **"Add New Project"** → `office-english` 레포 선택
3. **Environment Variables** 탭에서:
   - Key: `ANTHROPIC_API_KEY`
   - Value: [Anthropic API 키 입력]
4. **Deploy** 클릭

### Anthropic API 키 발급
- [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key

---

배포 후 고정 URL이 생겨서 언제 어디서 열어도 스크립트가 저장돼요.
