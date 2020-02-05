let SessionLoad = 1
if &cp | set nocp | endif
let s:cpo_save=&cpo
set cpo&vim
vmap gx <Plug>NetrwBrowseXVis
nmap gx <Plug>NetrwBrowseX
vnoremap <silent> <Plug>NetrwBrowseXVis :call netrw#BrowseXVis()
nnoremap <silent> <Plug>NetrwBrowseX :call netrw#BrowseX(expand((exists("g:netrw_gx")? g:netrw_gx : '<cfile>')),netrw#CheckIfRemote())
let &cpo=s:cpo_save
unlet s:cpo_save
set background=dark
set backspace=indent,eol,start
set expandtab
set fileencodings=ucs-bom,utf-8,default,latin1
set helplang=C.
set laststatus=2
set listchars=tab:|\ ,trail:·,extends:·,precedes:·
set mouse=a
set printoptions=paper:a4
set ruler
set runtimepath=~/.vim,~/.vim/bundle/Vundle.vim,~/.vim/bundle/gruvbox,~/.vim/bundle/tsuquyomi,~/.vim/bundle/typescript-vim,/var/lib/vim/addons,/usr/share/vim/vimfiles,/usr/share/vim/vim80,/usr/share/vim/vimfiles/after,/var/lib/vim/addons/after,~/.vim/after,~/.vim/bundle/Vundle.vim,~/.vim/bundle/Vundle.vim/after,~/.vim/bundle/gruvbox/after,~/.vim/bundle/tsuquyomi/after,~/.vim/bundle/typescript-vim/after
set shiftwidth=4
set showcmd
set suffixes=.bak,~,.swp,.o,.info,.aux,.log,.dvi,.bbl,.blg,.brf,.cb,.ind,.idx,.ilg,.inx,.out,.toc
set tabstop=4
set wildmenu
let s:so_save = &so | let s:siso_save = &siso | set so=0 siso=0
let v:this_session=expand("<sfile>:p")
silent only
cd /mnt/d/Users/Jonas/Workspace/InverseKinematics
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
set shortmess=aoO
badd +218 kinematics.ts
badd +54 run.ts
badd +428 skeleton.ts
badd +104 joints.ts
badd +79 animate.ts
badd +1 simple.xrig
badd +0 long.xrig
argglobal
silent! argdel *
$argadd kinematics.ts
edit run.ts
set splitbelow splitright
wincmd _ | wincmd |
vsplit
1wincmd h
wincmd _ | wincmd |
split
1wincmd k
wincmd w
wincmd w
wincmd _ | wincmd |
split
1wincmd k
wincmd w
set nosplitbelow
set nosplitright
wincmd t
set winminheight=1 winheight=1 winminwidth=1 winwidth=1
exe '1resize ' . ((&lines * 41 + 42) / 85)
exe 'vert 1resize ' . ((&columns * 173 + 173) / 346)
exe '2resize ' . ((&lines * 41 + 42) / 85)
exe 'vert 2resize ' . ((&columns * 173 + 173) / 346)
exe '3resize ' . ((&lines * 41 + 42) / 85)
exe 'vert 3resize ' . ((&columns * 172 + 173) / 346)
exe '4resize ' . ((&lines * 41 + 42) / 85)
exe 'vert 4resize ' . ((&columns * 172 + 173) / 346)
argglobal
let s:cpo_save=&cpo
set cpo&vim
map <buffer>  <Plug>(TsuquyomiGoBack)
map <buffer>  <Plug>(TsuquyomiSplitDefinition)
map <buffer> ] <Plug>(TsuquyomiSplitDefinition)
map <buffer>  <Plug>(TsuquyomiDefinition)
map <buffer>  <Plug>(TsuquyomiReferences)
noremap <buffer> <silent> <Plug>(TsuquyomiRenameSymbolCS) :TsuquyomiRenameSymbolCS 
noremap <buffer> <silent> <Plug>(TsuquyomiRenameSymbolS) :TsuquyomiRenameSymbolS 
noremap <buffer> <silent> <Plug>(TsuquyomiImport) :TsuquyomiImport 
noremap <buffer> <silent> <Plug>(TsuquyomiSignatureHelp) :TsuquyomiSignatureHelp 
noremap <buffer> <silent> <Plug>(TsuquyomiQuickFix) :TsuquyomiQuickFix 
noremap <buffer> <silent> <Plug>(TsuquyomiRenameSymbolC) :TsuquyomiRenameSymbolC 
noremap <buffer> <silent> <Plug>(TsuquyomiRenameSymbol) :TsuquyomiRenameSymbol 
noremap <buffer> <silent> <Plug>(TsuquyomiReferences) :TsuquyomiReferences 
noremap <buffer> <silent> <Plug>(TsuquyomiImplementation) :TsuquyomiImplementation 
noremap <buffer> <silent> <Plug>(TsuquyomiGoBack) :TsuquyomiGoBack 
noremap <buffer> <silent> <Plug>(TsuquyomiTypeDefinition) :TsuquyomiTypeDefinition 
noremap <buffer> <silent> <Plug>(TsuquyomiSplitDefinition) :TsuquyomiSplitDefinition 
noremap <buffer> <silent> <Plug>(TsuquyomiDefinition) :TsuquyomiDefinition 
let &cpo=s:cpo_save
unlet s:cpo_save
setlocal keymap=
setlocal noarabic
setlocal autoindent
setlocal backupcopy=
setlocal balloonexpr=tsuquyomi#balloonexpr()
setlocal nobinary
setlocal nobreakindent
setlocal breakindentopt=
setlocal bufhidden=
setlocal buflisted
setlocal buftype=
setlocal nocindent
setlocal cinkeys=0{,0},0),:,0#,!^F,o,O,e
setlocal cinoptions=
setlocal cinwords=if,else,while,do,for,switch
setlocal colorcolumn=
setlocal comments=s1:/*,mb:*,ex:*/,://,b:#,:%,:XCOMM,n:>,fb:-
setlocal commentstring=//\ %s
setlocal complete=.,w,b,u,t,i
setlocal concealcursor=
setlocal conceallevel=0
setlocal completefunc=
setlocal nocopyindent
setlocal cryptmethod=
setlocal nocursorbind
setlocal nocursorcolumn
set cursorline
setlocal cursorline
setlocal define=
setlocal dictionary=
setlocal nodiff
setlocal equalprg=
setlocal errorformat=%+A\ %#%f\ %#(%l\\,%c):\ %m,%C%m
setlocal expandtab
if &filetype != 'typescript'
setlocal filetype=typescript
endif
setlocal fixendofline
setlocal foldcolumn=0
setlocal foldenable
setlocal foldexpr=0
setlocal foldignore=#
setlocal foldlevel=0
setlocal foldmarker={{{,}}}
setlocal foldmethod=manual
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldtext=foldtext()
setlocal formatexpr=
setlocal formatoptions=croql
setlocal formatlistpat=^\\s*\\d\\+[\\]:.)}\\t\ ]\\s*
setlocal formatprg=
setlocal grepprg=
setlocal iminsert=0
setlocal imsearch=-1
setlocal include=
setlocal includeexpr=
setlocal indentexpr=GetTypescriptIndent()
setlocal indentkeys=o,O,*<Return>,<>>,<<>,/,{,},0],0)
setlocal noinfercase
setlocal iskeyword=@,48-57,_,192-255,$
setlocal keywordprg=
setlocal nolinebreak
setlocal nolisp
setlocal lispwords=
set list
setlocal list
setlocal makeencoding=
setlocal makeprg=tsc\ \ $*\ %
setlocal matchpairs=(:),{:},[:]
setlocal modeline
setlocal modifiable
setlocal nrformats=bin,octal,hex
set number
setlocal number
setlocal numberwidth=4
setlocal omnifunc=tsuquyomi#complete
setlocal path=
setlocal nopreserveindent
setlocal nopreviewwindow
setlocal quoteescape=\\
setlocal noreadonly
setlocal norelativenumber
setlocal norightleft
setlocal rightleftcmd=search
setlocal noscrollbind
setlocal shiftwidth=4
setlocal noshortname
setlocal signcolumn=auto
setlocal nosmartindent
setlocal softtabstop=0
setlocal nospell
setlocal spellcapcheck=[.?!]\\_[\\])'\"\	\ ]\\+
setlocal spellfile=
setlocal spelllang=en
setlocal statusline=
setlocal suffixesadd=.ts,.tsx
setlocal swapfile
setlocal synmaxcol=3000
if &syntax != 'typescript'
setlocal syntax=typescript
endif
setlocal tabstop=4
setlocal tagcase=
setlocal tags=
setlocal termkey=
setlocal termsize=
setlocal textwidth=0
setlocal thesaurus=
setlocal noundofile
setlocal undolevels=-123456
setlocal nowinfixheight
setlocal nowinfixwidth
setlocal wrap
setlocal wrapmargin=0
silent! normal! zE
let s:l = 14 - ((13 * winheight(0) + 20) / 41)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
14
normal! 09|
wincmd w
argglobal
if bufexists('joints.ts') | buffer joints.ts | else | edit joints.ts | endif
let s:cpo_save=&cpo
set cpo&vim
map <buffer>  <Plug>(TsuquyomiGoBack)
map <buffer>  <Plug>(TsuquyomiSplitDefinition)
map <buffer> ] <Plug>(TsuquyomiSplitDefinition)
map <buffer>  <Plug>(TsuquyomiDefinition)
map <buffer>  <Plug>(TsuquyomiReferences)
noremap <buffer> <silent> <Plug>(TsuquyomiRenameSymbolCS) :TsuquyomiRenameSymbolCS 
noremap <buffer> <silent> <Plug>(TsuquyomiRenameSymbolS) :TsuquyomiRenameSymbolS 
noremap <buffer> <silent> <Plug>(TsuquyomiImport) :TsuquyomiImport 
noremap <buffer> <silent> <Plug>(TsuquyomiSignatureHelp) :TsuquyomiSignatureHelp 
noremap <buffer> <silent> <Plug>(TsuquyomiQuickFix) :TsuquyomiQuickFix 
noremap <buffer> <silent> <Plug>(TsuquyomiRenameSymbolC) :TsuquyomiRenameSymbolC 
noremap <buffer> <silent> <Plug>(TsuquyomiRenameSymbol) :TsuquyomiRenameSymbol 
noremap <buffer> <silent> <Plug>(TsuquyomiReferences) :TsuquyomiReferences 
noremap <buffer> <silent> <Plug>(TsuquyomiImplementation) :TsuquyomiImplementation 
noremap <buffer> <silent> <Plug>(TsuquyomiGoBack) :TsuquyomiGoBack 
noremap <buffer> <silent> <Plug>(TsuquyomiTypeDefinition) :TsuquyomiTypeDefinition 
noremap <buffer> <silent> <Plug>(TsuquyomiSplitDefinition) :TsuquyomiSplitDefinition 
noremap <buffer> <silent> <Plug>(TsuquyomiDefinition) :TsuquyomiDefinition 
let &cpo=s:cpo_save
unlet s:cpo_save
setlocal keymap=
setlocal noarabic
setlocal autoindent
setlocal backupcopy=
setlocal balloonexpr=tsuquyomi#balloonexpr()
setlocal nobinary
setlocal nobreakindent
setlocal breakindentopt=
setlocal bufhidden=
setlocal buflisted
setlocal buftype=
setlocal nocindent
setlocal cinkeys=0{,0},0),:,0#,!^F,o,O,e
setlocal cinoptions=
setlocal cinwords=if,else,while,do,for,switch
setlocal colorcolumn=
setlocal comments=s1:/*,mb:*,ex:*/,://,b:#,:%,:XCOMM,n:>,fb:-
setlocal commentstring=//\ %s
setlocal complete=.,w,b,u,t,i
setlocal concealcursor=
setlocal conceallevel=0
setlocal completefunc=
setlocal nocopyindent
setlocal cryptmethod=
setlocal nocursorbind
setlocal nocursorcolumn
set cursorline
setlocal cursorline
setlocal define=
setlocal dictionary=
setlocal nodiff
setlocal equalprg=
setlocal errorformat=%+A\ %#%f\ %#(%l\\,%c):\ %m,%C%m
setlocal expandtab
if &filetype != 'typescript'
setlocal filetype=typescript
endif
setlocal fixendofline
setlocal foldcolumn=0
setlocal foldenable
setlocal foldexpr=0
setlocal foldignore=#
setlocal foldlevel=0
setlocal foldmarker={{{,}}}
setlocal foldmethod=manual
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldtext=foldtext()
setlocal formatexpr=
setlocal formatoptions=croql
setlocal formatlistpat=^\\s*\\d\\+[\\]:.)}\\t\ ]\\s*
setlocal formatprg=
setlocal grepprg=
setlocal iminsert=0
setlocal imsearch=-1
setlocal include=
setlocal includeexpr=
setlocal indentexpr=GetTypescriptIndent()
setlocal indentkeys=o,O,*<Return>,<>>,<<>,/,{,},0],0)
setlocal noinfercase
setlocal iskeyword=@,48-57,_,192-255,$
setlocal keywordprg=
setlocal nolinebreak
setlocal nolisp
setlocal lispwords=
set list
setlocal list
setlocal makeencoding=
setlocal makeprg=tsc\ \ $*\ %
setlocal matchpairs=(:),{:},[:]
setlocal modeline
setlocal modifiable
setlocal nrformats=bin,octal,hex
set number
setlocal number
setlocal numberwidth=4
setlocal omnifunc=tsuquyomi#complete
setlocal path=
setlocal nopreserveindent
setlocal nopreviewwindow
setlocal quoteescape=\\
setlocal noreadonly
setlocal norelativenumber
setlocal norightleft
setlocal rightleftcmd=search
setlocal noscrollbind
setlocal shiftwidth=4
setlocal noshortname
setlocal signcolumn=auto
setlocal nosmartindent
setlocal softtabstop=0
setlocal nospell
setlocal spellcapcheck=[.?!]\\_[\\])'\"\	\ ]\\+
setlocal spellfile=
setlocal spelllang=en
setlocal statusline=
setlocal suffixesadd=.ts,.tsx
setlocal swapfile
setlocal synmaxcol=3000
if &syntax != 'typescript'
setlocal syntax=typescript
endif
setlocal tabstop=4
setlocal tagcase=
setlocal tags=
setlocal termkey=
setlocal termsize=
setlocal textwidth=0
setlocal thesaurus=
setlocal noundofile
setlocal undolevels=-123456
setlocal nowinfixheight
setlocal nowinfixwidth
setlocal wrap
setlocal wrapmargin=0
silent! normal! zE
let s:l = 1 - ((0 * winheight(0) + 20) / 41)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
1
normal! 0
wincmd w
argglobal
if bufexists('kinematics.ts') | buffer kinematics.ts | else | edit kinematics.ts | endif
let s:cpo_save=&cpo
set cpo&vim
map <buffer>  <Plug>(TsuquyomiGoBack)
map <buffer>  <Plug>(TsuquyomiSplitDefinition)
map <buffer> ] <Plug>(TsuquyomiSplitDefinition)
map <buffer>  <Plug>(TsuquyomiDefinition)
map <buffer>  <Plug>(TsuquyomiReferences)
noremap <buffer> <silent> <Plug>(TsuquyomiRenameSymbolCS) :TsuquyomiRenameSymbolCS 
noremap <buffer> <silent> <Plug>(TsuquyomiRenameSymbolS) :TsuquyomiRenameSymbolS 
noremap <buffer> <silent> <Plug>(TsuquyomiImport) :TsuquyomiImport 
noremap <buffer> <silent> <Plug>(TsuquyomiSignatureHelp) :TsuquyomiSignatureHelp 
noremap <buffer> <silent> <Plug>(TsuquyomiQuickFix) :TsuquyomiQuickFix 
noremap <buffer> <silent> <Plug>(TsuquyomiRenameSymbolC) :TsuquyomiRenameSymbolC 
noremap <buffer> <silent> <Plug>(TsuquyomiRenameSymbol) :TsuquyomiRenameSymbol 
noremap <buffer> <silent> <Plug>(TsuquyomiReferences) :TsuquyomiReferences 
noremap <buffer> <silent> <Plug>(TsuquyomiImplementation) :TsuquyomiImplementation 
noremap <buffer> <silent> <Plug>(TsuquyomiGoBack) :TsuquyomiGoBack 
noremap <buffer> <silent> <Plug>(TsuquyomiTypeDefinition) :TsuquyomiTypeDefinition 
noremap <buffer> <silent> <Plug>(TsuquyomiSplitDefinition) :TsuquyomiSplitDefinition 
noremap <buffer> <silent> <Plug>(TsuquyomiDefinition) :TsuquyomiDefinition 
let &cpo=s:cpo_save
unlet s:cpo_save
setlocal keymap=
setlocal noarabic
setlocal autoindent
setlocal backupcopy=
setlocal balloonexpr=tsuquyomi#balloonexpr()
setlocal nobinary
setlocal nobreakindent
setlocal breakindentopt=
setlocal bufhidden=
setlocal buflisted
setlocal buftype=
setlocal nocindent
setlocal cinkeys=0{,0},0),:,0#,!^F,o,O,e
setlocal cinoptions=
setlocal cinwords=if,else,while,do,for,switch
setlocal colorcolumn=
setlocal comments=s1:/*,mb:*,ex:*/,://,b:#,:%,:XCOMM,n:>,fb:-
setlocal commentstring=//\ %s
setlocal complete=.,w,b,u,t,i
setlocal concealcursor=
setlocal conceallevel=0
setlocal completefunc=
setlocal nocopyindent
setlocal cryptmethod=
setlocal nocursorbind
setlocal nocursorcolumn
set cursorline
setlocal cursorline
setlocal define=
setlocal dictionary=
setlocal nodiff
setlocal equalprg=
setlocal errorformat=%+A\ %#%f\ %#(%l\\,%c):\ %m,%C%m
setlocal expandtab
if &filetype != 'typescript'
setlocal filetype=typescript
endif
setlocal fixendofline
setlocal foldcolumn=0
setlocal foldenable
setlocal foldexpr=0
setlocal foldignore=#
setlocal foldlevel=0
setlocal foldmarker={{{,}}}
setlocal foldmethod=manual
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldtext=foldtext()
setlocal formatexpr=
setlocal formatoptions=croql
setlocal formatlistpat=^\\s*\\d\\+[\\]:.)}\\t\ ]\\s*
setlocal formatprg=
setlocal grepprg=
setlocal iminsert=0
setlocal imsearch=-1
setlocal include=
setlocal includeexpr=
setlocal indentexpr=GetTypescriptIndent()
setlocal indentkeys=o,O,*<Return>,<>>,<<>,/,{,},0],0)
setlocal noinfercase
setlocal iskeyword=@,48-57,_,192-255,$
setlocal keywordprg=
setlocal nolinebreak
setlocal nolisp
setlocal lispwords=
set list
setlocal list
setlocal makeencoding=
setlocal makeprg=tsc\ \ $*\ %
setlocal matchpairs=(:),{:},[:]
setlocal modeline
setlocal modifiable
setlocal nrformats=bin,octal,hex
set number
setlocal number
setlocal numberwidth=4
setlocal omnifunc=tsuquyomi#complete
setlocal path=
setlocal nopreserveindent
setlocal nopreviewwindow
setlocal quoteescape=\\
setlocal noreadonly
setlocal norelativenumber
setlocal norightleft
setlocal rightleftcmd=search
setlocal noscrollbind
setlocal shiftwidth=4
setlocal noshortname
setlocal signcolumn=auto
setlocal nosmartindent
setlocal softtabstop=0
setlocal nospell
setlocal spellcapcheck=[.?!]\\_[\\])'\"\	\ ]\\+
setlocal spellfile=
setlocal spelllang=en
setlocal statusline=
setlocal suffixesadd=.ts,.tsx
setlocal swapfile
setlocal synmaxcol=3000
if &syntax != 'typescript'
setlocal syntax=typescript
endif
setlocal tabstop=4
setlocal tagcase=
setlocal tags=
setlocal termkey=
setlocal termsize=
setlocal textwidth=0
setlocal thesaurus=
setlocal noundofile
setlocal undolevels=-123456
setlocal nowinfixheight
setlocal nowinfixwidth
setlocal wrap
setlocal wrapmargin=0
silent! normal! zE
let s:l = 232 - ((40 * winheight(0) + 20) / 41)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
232
normal! 09|
wincmd w
argglobal
if bufexists('long.xrig') | buffer long.xrig | else | edit long.xrig | endif
setlocal keymap=
setlocal noarabic
setlocal noautoindent
setlocal backupcopy=
setlocal balloonexpr=
setlocal nobinary
setlocal nobreakindent
setlocal breakindentopt=
setlocal bufhidden=
setlocal buflisted
setlocal buftype=
setlocal nocindent
setlocal cinkeys=0{,0},0),:,0#,!^F,o,O,e
setlocal cinoptions=
setlocal cinwords=if,else,while,do,for,switch
setlocal colorcolumn=
setlocal comments=s1:/*,mb:*,ex:*/,://,b:#,:%,:XCOMM,n:>,fb:-
setlocal commentstring=/*%s*/
setlocal complete=.,w,b,u,t,i
setlocal concealcursor=
setlocal conceallevel=0
setlocal completefunc=
setlocal nocopyindent
setlocal cryptmethod=
setlocal nocursorbind
setlocal nocursorcolumn
set cursorline
setlocal cursorline
setlocal define=
setlocal dictionary=
setlocal nodiff
setlocal equalprg=
setlocal errorformat=
setlocal expandtab
if &filetype != ''
setlocal filetype=
endif
setlocal fixendofline
setlocal foldcolumn=0
setlocal foldenable
setlocal foldexpr=0
setlocal foldignore=#
setlocal foldlevel=0
setlocal foldmarker={{{,}}}
setlocal foldmethod=manual
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldtext=foldtext()
setlocal formatexpr=
setlocal formatoptions=tcq
setlocal formatlistpat=^\\s*\\d\\+[\\]:.)}\\t\ ]\\s*
setlocal formatprg=
setlocal grepprg=
setlocal iminsert=0
setlocal imsearch=-1
setlocal include=
setlocal includeexpr=
setlocal indentexpr=
setlocal indentkeys=0{,0},:,0#,!^F,o,O,e
setlocal noinfercase
setlocal iskeyword=@,48-57,_,192-255
setlocal keywordprg=
setlocal nolinebreak
setlocal nolisp
setlocal lispwords=
set list
setlocal list
setlocal makeencoding=
setlocal makeprg=
setlocal matchpairs=(:),{:},[:]
setlocal modeline
setlocal modifiable
setlocal nrformats=bin,octal,hex
set number
setlocal number
setlocal numberwidth=4
setlocal omnifunc=
setlocal path=
setlocal nopreserveindent
setlocal nopreviewwindow
setlocal quoteescape=\\
setlocal noreadonly
setlocal norelativenumber
setlocal norightleft
setlocal rightleftcmd=search
setlocal noscrollbind
setlocal shiftwidth=4
setlocal noshortname
setlocal signcolumn=auto
setlocal nosmartindent
setlocal softtabstop=0
setlocal nospell
setlocal spellcapcheck=[.?!]\\_[\\])'\"\	\ ]\\+
setlocal spellfile=
setlocal spelllang=en
setlocal statusline=
setlocal suffixesadd=
setlocal swapfile
setlocal synmaxcol=3000
if &syntax != ''
setlocal syntax=
endif
setlocal tabstop=4
setlocal tagcase=
setlocal tags=
setlocal termkey=
setlocal termsize=
setlocal textwidth=0
setlocal thesaurus=
setlocal noundofile
setlocal undolevels=-123456
setlocal nowinfixheight
setlocal nowinfixwidth
setlocal wrap
setlocal wrapmargin=0
silent! normal! zE
let s:l = 1 - ((0 * winheight(0) + 20) / 41)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
1
normal! 02|
lcd /mnt/d/Users/Jonas/Workspace/InverseKinematics
wincmd w
3wincmd w
exe '1resize ' . ((&lines * 41 + 42) / 85)
exe 'vert 1resize ' . ((&columns * 173 + 173) / 346)
exe '2resize ' . ((&lines * 41 + 42) / 85)
exe 'vert 2resize ' . ((&columns * 173 + 173) / 346)
exe '3resize ' . ((&lines * 41 + 42) / 85)
exe 'vert 3resize ' . ((&columns * 172 + 173) / 346)
exe '4resize ' . ((&lines * 41 + 42) / 85)
exe 'vert 4resize ' . ((&columns * 172 + 173) / 346)
tabnext 1
if exists('s:wipebuf')
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20 shortmess=filnxtToO
set winminheight=1 winminwidth=1
let s:sx = expand("<sfile>:p:r")."x.vim"
if file_readable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &so = s:so_save | let &siso = s:siso_save
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
