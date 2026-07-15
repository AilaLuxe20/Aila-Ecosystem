"use client";

import Container from "./Container";

export default function Section({
children,
}:{
children:React.ReactNode;
}){

return(

<section className="relative py-32">

<Container>

{children}

</Container>

</section>

);

}