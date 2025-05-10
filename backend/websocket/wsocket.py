
from fastapi import Depends, WebSocket, WebSocketDisconnect

from api.deps import get_private_chat_manager, get_token_manager
from serializers.chat_serializers import message_serializer
from crud.chat import PrivateChatManager
from services.token import TokenManager

connected_clients: dict[str, set] = dict()

async def chat_websocket_endpoint(
    chat_type: str,
    chat_id: str, 
    token: str,
    websocket: WebSocket,
    token_subject_key: str = 'id',
    token_manager: TokenManager = Depends(get_token_manager),
    pvt_chat_manager: PrivateChatManager = Depends(get_private_chat_manager),
):
    await websocket.accept()
    print(f"[+] WebSocket connection accepted for chat type: {chat_type}, chat ID: {chat_id}")
    
    try:
        current_user = await token_manager.get_user_form_jwt_token(token, token_subject_key)
        print(f"[User] username={current_user['username']} | id={current_user['id']}")
    except Exception as e:
        await websocket.send_json({"error": "Invalid token"})
        await websocket.close()
        return
    
    connected_clients.setdefault(chat_id, set()).add(websocket)
    print(f"[Connected Clients] {connected_clients}")
    
    try:
        while True:
            message = await websocket.receive_text()
            
            if chat_type == 'private':
                new_message = await pvt_chat_manager.create_message(current_user['id'], chat_id, message)

            serialized_message = message_serializer(new_message.model_dump())
            print("[Response Message]", serialized_message)
    
            for client_ws in connected_clients[chat_id]:
                print(f"client_ws: {client_ws}")
                await client_ws.send_json(serialized_message)
    
    except WebSocketDisconnect:
        print(f"[+] WebSocket connection closed")
        
    finally:
        print(f"Removed disconnected client websocket: {websocket} from the Chat id: {chat_id}")
        # remove clients
        connected_clients[chat_id].remove(websocket)
        
        if not connected_clients[chat_id]:
            del connected_clients[chat_id]
            print(f"[+] No more clients connected to chat ID: {chat_id}. Removed from connected_clients.")
        print("Finally remaining clints:", connected_clients)