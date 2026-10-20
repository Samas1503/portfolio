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
    <div
      style={{
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        backgroundColor: "#0a0a0a",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          margin: "0 auto",
          backgroundColor: "#111113",
          border: "1px solid #27272a",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #27272a",
            backgroundColor: "#18181b",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#fb2c36",
            }}
          >
            cv.samas-server.com
          </p>
          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "20px",
              fontWeight: 700,
              color: "#fafafa",
            }}
          >
            Nuevo mensaje de contacto
          </h1>
        </div>

        <div style={{ padding: "24px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "6px 0",
                    fontSize: "12px",
                    color: "#a1a1aa",
                    width: "80px",
                    verticalAlign: "top",
                  }}
                >
                  Nombre
                </td>
                <td style={{ fontSize: "14px", color: "#fafafa", fontWeight: 600 }}>
                  {username}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "6px 0",
                    fontSize: "12px",
                    color: "#a1a1aa",
                    verticalAlign: "top",
                  }}
                >
                  Email
                </td>
                <td style={{ fontSize: "14px" }}>
                  <a href={`mailto:${email}`} style={{ color: "#fb2c36" }}>
                    {email}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              backgroundColor: "#0a0a0a",
              border: "1px solid #27272a",
              borderLeft: "3px solid #fb2c36",
              borderRadius: "8px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "#a1a1aa",
              }}
            >
              Mensaje
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "14px",
                lineHeight: "1.6",
                color: "#e4e4e7",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {message}
            </p>
          </div>

          <p
            style={{
              margin: "20px 0 0",
              fontSize: "11px",
              color: "#71717a",
            }}
          >
            Respondé directo a este correo — el reply-to apunta a {email}.
          </p>
        </div>
      </div>
    </div>
  );
};
export const emailComponent: React.FC<EmailTemplateProps> = EmailTemplate;
