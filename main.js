/* global __dirname */

const fs=require('fs');
const path=require('path');
const TGAPI=require('./libs/tgapi');
const XOEngine=require('./libs/xo-engine');

const config_filename=path.join(__dirname,'config.json');
const config={};
if(fs.existsSync(config_filename))
	Object.assign(config,JSON.parse(fs.readFileSync(config_filename)));
else
	console.error('Create',config_filename,'first');
const bot=new TGAPI(config.token);
const wait=async ms=>new Promise(r=>setTimeout(r,ms));

const X='❌',O='⭕',X_win='❎',O_win='🅾';
const E='•',E_win='◦';//empty symbols

async function updates()
{
	if(!config.token)
		return console.error('Add "token" to your config with bot\'s token value');
	while(1)
	{
		try
		{
			let lastoffer=config.lastoffer;
			let u=await bot.getUpdates(config.lastoffer||0);
			if(!u || !u.ok || !u.result)
				throw new Error(u);
			await readUpdates(u);
			if(lastoffer!==config.lastoffer)
				fs.writeFileSync(config_filename,JSON.stringify(config,null,'\t'));
		}
		catch(e)
		{
			console.error(e);
		}
		await wait(1000);
	}
}

async function readUpdates(u)
{
	//step by step without Promise.all because of race condition
	for(let i=0;i<u.result.length;++i)
	{
		try
		{
			let r=u.result[i];
			if(!r)
				continue;
			if(r.update_id>=(config.lastoffer||0))
				config.lastoffer=r.update_id+1;
			if(r.callback_query)
			{
				await queryReply({callback_query:r.callback_query});
				continue;
			}
			if(!r.message || !r.message.chat)
				continue;
			await commands({
				chat_id:r.message.chat.id,
				text:r.message.text,
				username:r.message.from.username
			});
		}
		catch(e)
		{
			console.error(e);
		}
	}
}

async function queryReply({callback_query})
{
	if(!callback_query.message || !callback_query.message.chat)
		return;
	let chat_id=callback_query.message.chat.id;
	let {reply_markup,message_id,text}=callback_query.message;
	if([X,O].includes(callback_query.data))
	{
		let board=emptyBoard();
		if(callback_query.data===O)
		{
			let engine=XOEngine(boardToEngine(board),'X');
			board=engineToBoard(engine);
		}
		return bot.editMessageText(chat_id,message_id,`You chose ${callback_query.data}`,{
			reply_markup:JSON.stringify({inline_keyboard:board})
		});
	}
	if(/^\d_\d$/.test(callback_query.data))
	{
		let humanFirst=text.includes(X);
		if(!humanFirst && !text.includes(O))
			return;
		let [i,j]=callback_query.data.split('_');
		let board=reply_markup.inline_keyboard;
		if(board[i][j].text!==E)
			return;
		board[i][j].text=humanFirst?X:O;
		let engine=XOEngine(boardToEngine(board),humanFirst?'O':'X');
		board=engineToBoard(engine);
		if(engine.isXwin||engine.isOwin||engine.isDraw)
			return bot.editMessageText(chat_id,message_id,engine.isDraw?'Draw!':`You ${(humanFirst^engine.isOwin)?'win':'lose'}!`,{
				reply_markup:JSON.stringify({inline_keyboard:board})
			});
		return bot.editMessageReplyMarkup(chat_id,message_id,{inline_keyboard:board});
	}
}

async function commands({chat_id,text,username})
{
	if(text.includes('/start'))
		return bot.sendMessageReplyMarkup(chat_id,`${username}!
Choose your side: ${X} or ${O}

${X} goes first`,{"inline_keyboard":[[
			{text:X,callback_data:X},
			{text:O,callback_data:O}
]]});
}

function emptyBoard()
{
	let rows=[];
	for(let i=0;i<3;++i)
	{
		let cols=[];
		rows.push(cols);
		for(let j=0;j<3;++j)
			cols.push({text:E,callback_data:`${i}_${j}`});
	}
	return rows;
}

function boardToEngine(board)
{
	return board.map(r=>r.map(l=>l.text===X?'X':l.text===O?'O':''));
}

function engineToBoard(engine)
{
	function toTxt(l)
	{
		switch (l)
		{
			case 'X':
				return X;
			case 'O':
				return O;
			default:
				return (engine.isXwin||engine.isOwin)?E_win:E;
		}
	}
	let board=engine.board.map((r,i)=>r.map((l,j)=>({text:toTxt(l),callback_data:`${i}_${j}`})));
	setWinLine(board,engine);
	return board;
}

function setWinLine(board,engine)
{
	if(!engine.isOwin && !engine.isXwin)
		return;
	let win_line=[];
	for(let i=0;i<3;++i)
		win_line.push({text:engine.isXwin?X_win:O_win,callback_data:'W'});
	XOEngine.setLine(board,engine.win_line,win_line);
}

updates();