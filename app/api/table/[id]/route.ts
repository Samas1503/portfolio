// app/api/table/[id]/route.ts
import { NextResponse } from 'next/server'
import services from '@/backend/Services'
import { SchemaKeys } from "@/backend/data/schemas";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const tipo = new URL(request.url).searchParams.get('tipo') as SchemaKeys;
  const id = parseInt(params.id, 10)
  if (!tipo) throw new Error('falta ?tipo=')
  const data = await services.getDataByIdService(id, tipo)
  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const tipo = new URL(request.url).searchParams.get('tipo') as SchemaKeys;
  const id = parseInt(params.id, 10)
  const body = await request.json()
  if (!tipo) throw new Error('falta ?tipo=')
  const updated = await services.updateDataService(id, body, tipo)
  return NextResponse.json(updated)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const tipo = new URL(request.url).searchParams.get('tipo') as SchemaKeys;
  const id = parseInt(params.id, 10)
  if (!tipo) throw new Error('falta ?tipo=')
  await services.deleteDataByIdService(id, tipo)
  return NextResponse.json({ success: true })
}
