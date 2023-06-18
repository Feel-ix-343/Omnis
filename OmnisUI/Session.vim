let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/coding/LargerIdeas/Omnis/OmnisUI/src
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
badd +10 utils/gpt.ts
badd +67 PlanningView.tsx
badd +51 components/InfoPopup.tsx
badd +262 components/TaskInterface.tsx
badd +107 utils/taskStates.ts
badd +4 utils/database/databaseFunctions.ts
badd +231 ~/coding/LargerIdeas/Omnis/OmnisUI/node_modules/.pnpm/solid-js@1.6.10/node_modules/solid-js/types/reactive/signal.d.ts
badd +1300 ~/coding/LargerIdeas/Omnis/OmnisUI/node_modules/.pnpm/typescript@4.9.5/node_modules/typescript/lib/lib.es5.d.ts
badd +1 ~/coding/LargerIdeas/Omnis/OmnisUI
badd +4 ~/coding/LargerIdeas/Omnis/OmnisUI/.env
badd +5 ~/coding/LargerIdeas/Omnis/OmnisUI/.env.production
badd +4 utils/database/supabaseClient.ts
badd +1 ~/coding/LargerIdeas/Omnis/OmnisUI/.gitignore
badd +8 LoginScreen.tsx
badd +7 utils/autoscheduling.ts
badd +27 App.tsx
badd +8 ~/coding/LargerIdeas/Omnis/OmnisUI/node_modules/.pnpm/vite@4.1.1_@types+node@18.14.0/node_modules/vite/types/importMeta.d.ts
argglobal
%argdel
$argadd ~/coding/LargerIdeas/Omnis/OmnisUI
edit LoginScreen.tsx
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
wincmd _ | wincmd |
vsplit
1wincmd h
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
exe 'vert 1resize ' . ((&columns * 20 + 93) / 187)
exe 'vert 2resize ' . ((&columns * 166 + 93) / 187)
argglobal
enew
file neo-tree\ filesystem\ \[1]
balt PlanningView.tsx
setlocal fdm=manual
setlocal fde=nvim_treesitter#foldexpr()
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=99
setlocal fml=1
setlocal fdn=99
setlocal fen
wincmd w
argglobal
balt ~/coding/LargerIdeas/Omnis/OmnisUI/.env.production
setlocal fdm=expr
setlocal fde=nvim_treesitter#foldexpr()
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=99
setlocal fml=1
setlocal fdn=99
setlocal fen
4
normal! zo
11
normal! zo
12
normal! zo
let s:l = 8 - ((7 * winheight(0) + 19) / 38)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 8
normal! 061|
wincmd w
2wincmd w
exe 'vert 1resize ' . ((&columns * 20 + 93) / 187)
exe 'vert 2resize ' . ((&columns * 166 + 93) / 187)
if exists(':tcd') == 2 | tcd ~/coding/LargerIdeas/Omnis/OmnisUI | endif
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
