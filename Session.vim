let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
badd +0 Documents/projects/fluxcraft/polars-wasm/src/core/mod.rs
badd +0 term://~/Documents/projects/fluxcraft//354160:/usr/bin/zsh
badd +1 term://~/Documents/projects/fluxcraft//363609:/usr/bin/zsh
argglobal
%argdel
edit Documents/projects/fluxcraft/polars-wasm/src/core/mod.rs
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
wincmd _ | wincmd |
split
1wincmd k
wincmd w
let &splitbelow = s:save_splitbelow
let &splitright = s:save_splitright
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
exe '1resize ' . ((&lines * 39 + 31) / 62)
exe '2resize ' . ((&lines * 20 + 31) / 62)
argglobal
setlocal foldmethod=expr
setlocal foldexpr=v:lua.require'astroui.folding'.foldexpr()
setlocal foldmarker={{{,}}}
setlocal foldignore=#
setlocal foldlevel=99
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldenable
let s:l = 43 - ((18 * winheight(0) + 19) / 38)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 43
normal! 09|
lcd ~/Documents/projects/fluxcraft
wincmd w
argglobal
if bufexists(fnamemodify("term://~/Documents/projects/fluxcraft//363609:/usr/bin/zsh", ":p")) | buffer term://~/Documents/projects/fluxcraft//363609:/usr/bin/zsh | else | edit term://~/Documents/projects/fluxcraft//363609:/usr/bin/zsh | endif
if &buftype ==# 'terminal'
  silent file term://~/Documents/projects/fluxcraft//363609:/usr/bin/zsh
endif
balt ~/Documents/projects/fluxcraft/polars-wasm/src/core/mod.rs
setlocal foldmethod=expr
setlocal foldexpr=v:lua.require'astroui.folding'.foldexpr()
setlocal foldmarker={{{,}}}
setlocal foldignore=#
setlocal foldlevel=99
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldenable
let s:l = 1 - ((0 * winheight(0) + 10) / 20)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 1
normal! 0
lcd ~/Documents/projects/fluxcraft
wincmd w
2wincmd w
exe '1resize ' . ((&lines * 39 + 31) / 62)
exe '2resize ' . ((&lines * 20 + 31) / 62)
tabnext 1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20
let &shortmess = s:shortmess_save
let &winminheight = s:save_winminheight
let &winminwidth = s:save_winminwidth
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
