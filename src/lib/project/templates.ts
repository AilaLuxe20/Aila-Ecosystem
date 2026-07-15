export const templates = {

  page: `export default function Page(){
return(
<main>
Hello from Aila
</main>
);
}`,

  layout: `export default function RootLayout({
children,
}:{
children:React.ReactNode;
}){
return(
<html>
<body>{children}</body>
</html>
);
}`,

};
