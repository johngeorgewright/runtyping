const TYPE_PLACEHOLDER = '{type}'

export default function typeNameFormatter(typeNameFormat?: string) {
  if (typeNameFormat && !typeNameFormat.includes(TYPE_PLACEHOLDER))
    throw new Error(
      `Type format must contain placeholder '${TYPE_PLACEHOLDER}'. Got: "${typeNameFormat}".`
    )

  return (name: string) =>
    typeNameFormat ? typeNameFormat.replace(TYPE_PLACEHOLDER, name) : name
}

export type TypeNameFormatter = ReturnType<typeof typeNameFormatter>
