import { useState } from 'react'

const useSelectionList = initialState => {
  const [selected, setSelected] = useState(initialState)

  const toggleSelected = element => e => {
    if (selected.includes(element)) {
      setSelected(selected.filter(section => section !== element))
    } else {
      setSelected([element, ...selected])
    }
  }

  const setSelections = list => setSelected(list)

  return [selected, toggleSelected, setSelections]
}

export default useSelectionList
