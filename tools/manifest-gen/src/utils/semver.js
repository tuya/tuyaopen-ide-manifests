export function bumpVersion(version, part = 'patch') {
  if (typeof version !== 'string') throw new Error(`Invalid semver: ${JSON.stringify(version)}`)
  const parts = version.split('.')
  if (parts.length !== 3) throw new Error(`Invalid semver: ${version}`)
  let [major, minor, patch] = parts.map(Number)
  if ([major, minor, patch].some(Number.isNaN)) throw new Error(`Invalid semver: ${version}`)
  if (part === 'major') { major++; minor = 0; patch = 0 }
  else if (part === 'minor') { minor++; patch = 0 }
  else { patch++ }
  return `${major}.${minor}.${patch}`
}
