function XOEngine(board,bot_step)
{
	let O={isXwin:false,isOwin:false,isDraw:false,board,win_line:-1};
	function result()
	{
		checkGame(board,O);
		return O;
	}
	if(checkGame(board,O))
		return O;
	if(iWantWin(board,bot_step))
		return result();
	if(iDoNotWantLose(board,bot_step))
		return result();
	if(makeFirstStep(board,bot_step))
		return result();
	if(makeSomeStep(board,bot_step))
		return result();
	if(makeCenterStep(board,bot_step))
		return result();
	if(makeDiagonalStep(board,bot_step))
		return result();
	makeRandomStep(board,bot_step);
	return result();
}

function checkGame(board,options)
{
	for(let i=0;i<8;++i)
	{
		let l=wholeLine(XOEngine.getLine(board,i));
		if(!l)
			continue;
		return !!Object.assign(options,{
			isXwin:l==='X',
			isOwin:l==='O',
			win_line:i
		});
	}
	options.isDraw=board.every(b=>b.every(l=>!!l));
	return options.isDraw;
}

XOEngine.getLine=(board,i)=>{
	if(i<3)
		return board[i].slice();
	if(i<6)
		return board.map(b=>b[i-3]);
	if(i===6)
		return board.map((b,j)=>b[j]);
	return board.map((b,j)=>b[2-j]);
};

XOEngine.setLine=(board,i,line)=>{
	if(i<3)
		return board[i]=line;
	if(i<6)
		return board.forEach((b,j)=>b[i-3]=line[j]);
	if(i===6)
		return board.forEach((b,j)=>b[j]=line[j]);
	board.forEach((b,j)=>b[2-j]=line[j]);
};

function wholeLine(line)
{
	let i=1;
	for(;line[0] && i<line.length;++i)
		if(line[i]!==line[0])
			break;
	return i===line.length?line[0]:'';
}

function twoOf3(line)
{
	if(!line[0] && line[1]===line[2])
		return line[1];
	if(!line[1] && line[0]===line[2])
		return line[0];
	if(!line[2] && line[1]===line[0])
		return line[1];
	return '';
}

function justMe(line,bot_step)
{
	if(line[0]===bot_step && !line[1] && !line[2])
		return 0;
	if(line[1]===bot_step && !line[0] && !line[2])
		return 1;
	if(line[2]===bot_step && !line[1] && !line[0])
		return 2;
	return -1;
}

function isEmptyBoard(board)
{
	return board.every(b=>b.every(l=>!l));
}

function iWantWin(board,bot_step)
{
	for(let i=0;i<8;++i)
	{
		let line=XOEngine.getLine(board,i);
		if(twoOf3(line)!==bot_step)
			continue;
		line.forEach((l,i)=>line[i]=bot_step);
		XOEngine.setLine(board,i,line);
		return true;
	}
}

function iDoNotWantLose(board,bot_step)
{
	for(let i=0;i<8;++i)
	{
		let line=XOEngine.getLine(board,i);
		let to3=twoOf3(line);
		if(!to3 || to3===bot_step)
			continue;
		line.forEach((l,i)=>{
			if(!line[i])
				line[i]=bot_step;
		});
		XOEngine.setLine(board,i,line);
		return true;
	}
}

function makeFirstStep(board,bot_step)
{
	if(!isEmptyBoard(board))
		return false;
	let K=Math.random();
	if(K<0.25)
		return board[0][0]=bot_step;
	if(K<0.5)
		return board[board.length-1][0]=bot_step;
	if(K<0.5)
		return board[0][board.length-1]=bot_step;
	return board[board.length-1][board.length-1]=bot_step;
}

function makeSomeStep(board,bot_step)
{
	for(let i=0;i<8;++i)
	{
		let line=XOEngine.getLine(board,i);
		let jm=justMe(line,bot_step);
		if(jm<0)
			continue;
		if(jm===0)
			line[2]=bot_step;
		else
			line[0]=bot_step;
		XOEngine.setLine(board,i,line);
		return true;
	}
	return false;
}

function makeCenterStep(board,bot_step)
{
	if(board[1][1])
		return false;
	return board[1][1]=bot_step;
}

function makeDiagonalStep(board,bot_step)
{
	return makeRandomStep(board,bot_step,2);
}

function makeRandomStep(board,bot_step,s=1)
{
	let p=[];
	for(let i=0;i<3;i+=s)
		for(let j=0;j<3;j+=s)
			p.push(`${i}_${j}`);
	shuffle(p);
	return p.some(l=>{
		let [i,j]=l.split('_');
		if(board[i][j])
			return false;
		return board[i][j]=bot_step;
	});
}

function shuffle(a)
{
	for(let i=a.length-1;i>0;--i)
	{
		const j=Math.floor(Math.random()*(i+1));
		[a[i],a[j]]=[a[j],a[i]];
	}
	return a;
}

module.exports=XOEngine;
