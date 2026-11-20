import "server-only";
import { Document, Link, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { CvData, CvEntry, CvLine } from "./data";

const BLUE = "#1f3c99";
const ACCENT = "#2d5be3";
const LINK = "#1a4fd6";

const makeStyles = (size: number) =>
  StyleSheet.create({
    page: {
      fontFamily: "Times-Roman",
      fontSize: size,
      lineHeight: 1.18,
      color: "#111",
      paddingTop: 22,
      paddingBottom: 18,
      paddingHorizontal: 34,
    },
    name: { fontFamily: "Times-Bold", fontSize: size * 2.35, lineHeight: 1.05, color: BLUE, letterSpacing: 0.3 },
    titulo: {
      fontFamily: "Times-Bold",
      fontSize: size * 1.18,
      color: ACCENT,
      marginTop: 2,
      lineHeight: 1.1,
      paddingBottom: 3,
      borderBottomWidth: 2,
      borderBottomColor: BLUE,
    },
    contact: { flexDirection: "row", flexWrap: "wrap", marginTop: 4, color: "#333" },
    sep: { marginHorizontal: 4, color: "#777" },
    link: { color: LINK, textDecoration: "none" },
    h2: {
      fontFamily: "Times-Bold",
      fontSize: size * 1.1,
      color: BLUE,
      letterSpacing: 0.8,
      marginTop: size * 0.55,
      marginBottom: 2,
      paddingBottom: 1,
      borderBottomWidth: 1,
      borderBottomColor: "#c9d2ea",
    },
    justify: { textAlign: "justify" },
    entry: { marginTop: size * 0.3 },
    row: { flexDirection: "row", justifyContent: "space-between" },
    entryTitle: { fontFamily: "Times-Bold", fontSize: size * 1.08, flexShrink: 1 },
    sub: { fontFamily: "Times-Italic", color: "#444", flexShrink: 1 },
    meta: { color: "#333", marginLeft: 8, textAlign: "right" },
    bullet: { flexDirection: "row", marginTop: 1, paddingLeft: 6 },
    dot: { width: 9 },
    bulletText: { flex: 1, textAlign: "justify" },
    bold: { fontFamily: "Times-Bold" },
    skillRow: { flexDirection: "row", marginTop: 1 },
    skillLabel: { fontFamily: "Times-Bold", width: size * 11 },
    lineItem: { marginTop: 1.5, textAlign: "justify" },
  });

type Styles = ReturnType<typeof makeStyles>;

const Bullet = ({ s, children }: { s: Styles; children: string }) => (
  <View style={s.bullet} wrap={false}>
    <Text style={s.dot}>•</Text>
    <Text style={s.bulletText}>{children}</Text>
  </View>
);

const Section = ({ s, title, children }: { s: Styles; title: string; children: React.ReactNode }) => (
  <View>
    <Text style={s.h2} minPresenceAhead={30}>{title.toUpperCase()}</Text>
    {children}
  </View>
);

const Entry = ({ s, entry }: { s: Styles; entry: CvEntry }) => (
  <View style={s.entry}>
    <View wrap={false}>
      <View style={s.row}>
        <Text style={s.entryTitle}>
          {entry.title}
          {entry.subtitle ? <Text style={s.sub}>{` — ${entry.subtitle}`}</Text> : null}
        </Text>
        {entry.period ? <Text style={s.meta}>{entry.period}</Text> : null}
      </View>
      {entry.place || entry.link ? (
        <View style={s.row}>
          <Text style={s.sub}>{entry.place ?? ""}</Text>
          {entry.link ? (
            <Link src={entry.link.href ?? ""} style={[s.meta, s.link]}>
              {entry.link.label}
            </Link>
          ) : null}
        </View>
      ) : null}
    </View>
    {entry.bullets.map((b, i) => (
      <Bullet key={i} s={s}>{b}</Bullet>
    ))}
  </View>
);

const LabeledLine = ({ s, line }: { s: Styles; line: CvLine }) => (
  <Text style={s.lineItem}>
    <Text style={s.bold}>{line.label}: </Text>
    {line.text}
  </Text>
);

function CvDocument({ data, size }: { data: CvData; size: number }) {
  const s = makeStyles(size);
  return (
    <Document title={`CV — ${data.nombre}`} author={data.nombre} subject={data.titulo} creator="cv.samas-server.com">
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{data.nombre.toUpperCase()}</Text>
        {data.titulo ? <Text style={s.titulo}>{data.titulo.toUpperCase()}</Text> : null}
        <View style={s.contact}>
          {data.contacto.map((c, i) => (
            <View key={i} style={{ flexDirection: "row" }}>
              {i > 0 ? <Text style={s.sep}>·</Text> : null}
              {c.href ? (
                <Link src={c.href} style={s.link}>{c.label}</Link>
              ) : (
                <Text>{c.label}</Text>
              )}
            </View>
          ))}
        </View>

        {data.resumen ? (
          <Section s={s} title="Resumen profesional">
            <Text style={s.justify}>{data.resumen}</Text>
          </Section>
        ) : null}

        {data.experiencia.length ? (
          <Section s={s} title="Experiencia profesional">
            {data.experiencia.map((e, i) => <Entry key={i} s={s} entry={e} />)}
          </Section>
        ) : null}

        {data.destacados.length || data.otrosProyectos.length ? (
          <Section s={s} title="Proyectos destacados">
            {data.destacados.map((e, i) => <Entry key={i} s={s} entry={e} />)}
            {data.otrosProyectos.length ? (
              <View style={s.entry}>
                <Text style={s.entryTitle}>Otros proyectos</Text>
                {data.otrosProyectos.map((p, i) => (
                  <View key={i} style={s.bullet} wrap={false}>
                    <Text style={s.dot}>•</Text>
                    <Text style={s.bulletText}>
                      <Text style={s.bold}>{p.label}: </Text>
                      {p.text}
                      {p.link ? (
                        <Text>
                          {" "}
                          <Link src={p.link.href ?? ""} style={s.link}>{p.link.label}</Link>
                        </Text>
                      ) : null}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Section>
        ) : null}

        {data.skills.length ? (
          <Section s={s} title="Skills técnicas">
            {data.skills.map((g) => (
              <View key={g.label} style={s.skillRow} wrap={false}>
                <Text style={s.skillLabel}>{g.label}:</Text>
                <Text style={s.bulletText}>{g.items.join(" · ")}</Text>
              </View>
            ))}
            {data.blandas.length ? (
              <View style={s.skillRow} wrap={false}>
                <Text style={s.skillLabel}>Habilidades blandas:</Text>
                <Text style={s.bulletText}>{data.blandas.join(" · ")}</Text>
              </View>
            ) : null}
          </Section>
        ) : null}

        {data.competencias.length ? (
          <Section s={s} title="Competencias y participaciones">
            {data.competencias.map((l) => <LabeledLine key={l.label} s={s} line={l} />)}
          </Section>
        ) : null}

        {data.educacion.length ? (
          <Section s={s} title="Educación y certificaciones">
            {data.educacion.map((l, i) => <LabeledLine key={i} s={s} line={l} />)}
          </Section>
        ) : null}

        {data.idiomas.length ? (
          <Section s={s} title="Idiomas">
            <Text>
              {data.idiomas.map((l, i) => (
                <Text key={i}>
                  {i > 0 ? "     " : ""}
                  <Text style={s.bold}>{l.label}{l.text ? ": " : ""}</Text>
                  {l.text}
                </Text>
              ))}
            </Text>
          </Section>
        ) : null}
      </Page>
    </Document>
  );
}

export async function renderCv(data: CvData, size: number) {
  const buffer = await renderToBuffer(<CvDocument data={data} size={size} />);
  const pages = (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) ?? []).length;
  return { buffer, pages };
}
