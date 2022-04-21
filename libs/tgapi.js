/* global Buffer */

const request=require('./mini-request');

function TGAPI(token)
{
	let api=async (method,parameters=null)=>{
		let data=JSON.stringify(parameters);
		return JSON.parse(await request('https://api.telegram.org/bot'+token+'/'+method,{
			method:'POST',
			headers:{
				'Content-type':'application/json; charset=utf-8',
				'Content-length':Buffer.byteLength(data)
			}
		},data));
	};
	this.getUpdates=async (offset=0)=>{
		let o={};
		if(offset>0)
			o.offset=offset;
		return api('getUpdates',o);
	};
	this.sendMessage=async (chat_id,text,options={})=>{
		return api('sendMessage',Object.assign({
			chat_id,
			text,
			disable_web_page_preview:true
		},options));
	};
	this.sendMessageReplyMarkup=async (chat_id,text,reply_markup,options={})=>{
		return this.sendMessage(chat_id,text,Object.assign({
			reply_markup:JSON.stringify(reply_markup)
		},options));
	};
	this.editMessageText=async (chat_id,message_id,text,options={})=>{
		return api('editMessageText',Object.assign({
			chat_id,
			message_id:parseInt(message_id),
			disable_web_page_preview:true,
			text
		},options));
	};
	this.editMessageReplyMarkup=async (chat_id,message_id,reply_markup,options={})=>{
		return api('editMessageReplyMarkup',Object.assign({
			chat_id,
			message_id:parseInt(message_id),
			reply_markup:JSON.stringify(reply_markup)
		},options));
	};
	this.deleteMessage=async (chat_id,message_id,options={})=>{
		return api('deleteMessage',Object.assign({
			chat_id,
			message_id:parseInt(message_id)
		},options));
	};
}

module.exports=TGAPI;