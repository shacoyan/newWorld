# こんまに ハンバーガーメニュー トランジション実装

**日付:** 2026-04-01
**担当:** Engineer A

## 背景

ハンバーガーメニューが `{menuOpen && (...)}` の条件付きレンダリングのため、CSS transitionが効かない（即座に出現・消滅する）。気持ちよく動くよう修正する。

## 変更ファイル

- `salary-app-react/src/components/Header.jsx`
- `salary-app-react/src/style.css`

## 現状

### Header.jsx（抜粋）
```jsx
<button className="hamburger-btn" onClick={() => setMenuOpen(prev => !prev)}>
  ☰
</button>

{menuOpen && (
  <>
    <div className="hamburger-overlay" onClick={closeMenu}></div>
    <div className="hamburger-menu">
      ...
    </div>
  </>
)}
```

### style.css（抜粋）
```css
.hamburger-btn { font-size: 24px; color: white; ... }
.hamburger-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.3); }
.hamburger-menu { position: fixed; top: 0; right: 0; bottom: 0; width: 240px; z-index: 201; ... }
/* ← transitionなし */
```

## 実装仕様

### Header.jsx の変更

1. `{menuOpen && (...)}` を廃止し、常時レンダリングに変更
2. `menuOpen` の状態を `is-open` クラスで付与して制御
3. ハンバーガーボタンを `☰` テキストから3本の `<span>` に変更
4. ボタンに `is-open` クラスを付与（メニューと連動）

```jsx
<button
  className={`hamburger-btn${menuOpen ? ' is-open' : ''}`}
  onClick={() => setMenuOpen(prev => !prev)}
  aria-expanded={menuOpen}
>
  <span></span>
  <span></span>
  <span></span>
</button>

<div className={`hamburger-overlay${menuOpen ? ' is-open' : ''}`} onClick={closeMenu}></div>
<div className={`hamburger-menu${menuOpen ? ' is-open' : ''}`}>
  ...（中身はそのまま）
</div>
```

※ `<> </>` フラグメントは不要になる（常時レンダリングのため）

### style.css の変更

`.hamburger-btn` を3本線スタイルに変更し、`.is-open` で✕アニメーション:

```css
.hamburger-btn {
  border: none;
  background: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
}

.hamburger-btn span {
  display: block;
  width: 22px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.hamburger-btn.is-open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.hamburger-btn.is-open span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}
.hamburger-btn.is-open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}
```

`.hamburger-overlay` にフェードイン追加:

```css
.hamburger-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.hamburger-overlay.is-open {
  opacity: 1;
  pointer-events: auto;
}
```

`.hamburger-menu` に右スライドイン追加:

```css
.hamburger-menu {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 240px;
  z-index: 201;
  background: white;
  padding: 24px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transform: translateX(100%);
  transition: transform 0.25s ease;
}

.hamburger-menu.is-open {
  transform: translateX(0);
}
```

## 注意事項

- フラグメント `<> </>` の扱いに注意（overlayとmenuを `<>` で囲む必要がなくなるが、Reactコンポーネントのreturn直下は単一要素なので `<> </>` は残す）
- メニュー内ボタンの `onClick` は変更不要
- `menuOpen` state・`closeMenu` 関数はそのまま流用
