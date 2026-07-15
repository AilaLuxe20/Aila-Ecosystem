"use client";

import WorkspaceSidebar from "./WorkspaceSidebar";
import WorkspaceTopbar from "./WorkspaceTopbar";

export default function Workspace({
children,
}:{
children:React.ReactNode;
}){

return(

<div className="grid min-h-screen lg:grid-cols-[320px_1fr]">

<WorkspaceSidebar/>

<div>

<WorkspaceTopbar/>

<div className="p-10">

{children}

</div>

</div>

</div>

);

}