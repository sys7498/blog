# CV (LaTeX)

내 CV는 유명한 LaTeX 템플릿으로 관리합니다. 웹사이트 About 페이지의
**"Download CV (PDF)"** 버튼은 `src/assets/Yoonseok_Shin_CV.pdf` 를 엽니다.
그래서 한 번 컴파일해서 그 위치에 PDF를 두면 끝입니다.

## 빠른 방법 — Overleaf (추천, 설치 불필요)

1. <https://www.overleaf.com> 접속 → **New Project → Upload Project** 로 `cv.tex` 업로드
   (또는 New Project → Blank, 내용 붙여넣기)
2. 좌상단 **Menu → Compiler 를 XeLaTeX** 로 설정
3. **Recompile** → PDF 다운로드
4. 받은 PDF를 `src/assets/Yoonseok_Shin_CV.pdf` 로 저장 → 사이트 버튼과 연결됨

> `moderncv` 는 Overleaf / TeX Live 에 기본 내장되어 추가 파일 없이 바로 컴파일됩니다.

## 로컬 컴파일 (TeX Live / MiKTeX 설치된 경우)

```bash
cd cv
latexmk -xelatex cv.tex      # 또는: xelatex cv.tex
cp cv.pdf ../src/assets/Yoonseok_Shin_CV.pdf
```

## 스타일 바꾸기

`cv.tex` 상단:

```latex
\moderncvstyle{banking}   % classic / casual / banking / oldstyle / fancy
\moderncvcolor{blue}      % black / blue / burgundy / green / grey / orange / purple / red
```

## 더 화려한 모던 템플릿을 원하면 — Awesome-CV

가장 인기 있는 모던 학술 CV 템플릿입니다 (별도 클래스 파일·폰트 필요).

- 저장소: <https://github.com/posquit0/Awesome-CV>
- Overleaf 템플릿: "Awesome CV" 검색 → 템플릿 열기 → `cv.tex` 의 각 섹션 내용을
  이 파일의 데이터로 교체
- 한국 연구자용 큐레이션: <https://github.com/LimHyungTae/Awesome-PhD-CV>

## 데이터 출처

이 CV의 내용은 웹사이트와 동일한 정보입니다.
- 인적사항·학력·경력·스킬: `src/data/profile.ts`
- 논문: `src/assets/publications.bib`

profile / bib 를 수정했다면 이 `cv.tex` 도 함께 갱신하세요(자동 동기화는 아님).
