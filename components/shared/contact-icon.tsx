import {
  Facebook,
  Github,
  Globe,
  Instagram,
  Link,
  Linkedin,
  Mail,
  MessageCircle,
  Phone,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";

export const CONTACT_ICONS: Record<string, LucideIcon> = {
  Phone,
  Mail,
  Github,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  MessageCircle,
  Globe,
};

const ContactIcon = ({ name }: { name: string | null }) => {
  const Icon = CONTACT_ICONS[name ?? ""] ?? Link;
  return <Icon />;
};

export default ContactIcon;
