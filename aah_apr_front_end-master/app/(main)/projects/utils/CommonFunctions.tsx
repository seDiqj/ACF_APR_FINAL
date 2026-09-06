import { useParentContext } from "@/contexts/ParentContext";

export const handleDelete = (url: string, id: string | null) => {
    const {axiosInstance, reqForToastAndSetMessage} = useParentContext();
    
    if (!id) return;
    
    axiosInstance.delete(url+`/${id}`)
    .then((response: any) => reqForToastAndSetMessage(response.data.message))
    .catch((error: any) => reqForToastAndSetMessage(error.response.data.message))
}