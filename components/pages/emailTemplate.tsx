import * as React from "react";

interface EmailTemplateProps {
  username: string;
  message: string;
  email: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  username,
  message,
  email,
}) => {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.5" }}>
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> {username}</p>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Mensaje:</strong></p>
      <p>{message}</p>
    </div>
  );
};
export const emailComponent: React.FC<EmailTemplateProps> = EmailTemplate; 