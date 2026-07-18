export const renderEmailTemplate = (data: any) => {
  return `<h1>New Inquiry from ${data.name}</h1><p>${data.description}</p>`;
};