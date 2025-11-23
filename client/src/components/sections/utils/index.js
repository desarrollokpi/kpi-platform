export const stringifySectionKey = section =>
  JSON.stringify({
    reportId: section.reportId,
    sectionId: section.sectionId || section.id,
  })

export const stringifySectionKeys = keys =>
  keys.map(key => stringifySectionKey(key))

export const parseSectionKeys = strings =>
  strings.map(string => JSON.parse(string))

export const renderSectionNames = (strings, stateSections, loading) => {
  if (loading) return ''

  const sectionsNames = parseSectionKeys(strings).map(
    section =>
      stateSections.find(stateSection => stateSection.id === section.sectionId)
        ?.name
  )

  return sectionsNames.join(', ')
}
