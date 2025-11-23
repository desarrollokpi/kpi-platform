import { useSelector } from 'react-redux'

const useReadSectionByCompoundId = sectionCompoundKey => {
  const { sections } = useSelector(state => state.sections)

  return sections.find(
    section =>
      sectionCompoundKey.sectionId === section.id &&
      sectionCompoundKey.reportId === section.reportId
  )
}

export default useReadSectionByCompoundId
