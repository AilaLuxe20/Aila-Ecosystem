interface EmailTemplateData {
    name: string;
    email: string;
    company: string | null;
    projectType: string;
    idea: string;
    description: string;
    inquiryId: string;
}

export const renderEmailTemplate = (data: EmailTemplateData) => {
  return `<h1>New Inquiry from ${data.name}</h1><p>${data.description}</p>`;
};