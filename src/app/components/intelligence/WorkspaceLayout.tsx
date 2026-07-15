"use client";

import Workspace from "./Workspace";

export default function WorkspaceLayout({
children,
}:{
children:React.ReactNode;
}){

return(

<Workspace>

{children}

</Workspace>

);

}