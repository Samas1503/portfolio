"use client";

import { useUsuario } from "@/context/UserContext";

export default function InfoUsuario() {
  const { usuario } = useUsuario();

  return usuario;
}