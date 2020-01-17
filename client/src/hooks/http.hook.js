import {useState, useCallback} from 'react';

export const useHttp = () => {
  const[loading, setLoading] = useState(false)
  const[error, setError] = useState(false)

  //что бы реакт не входил в рекурсию испеользуем юсекаллбэк
  const request = useCallback(async (url, method = "GET", body = null, headers={}) => {
    setLoading(true)
    try {
      //если бади есть то мы переводим его в джейсон и добавляем хедер
      if (body) {
        body = JSON.stringify(body)
        //нужно явно указать что мы передаем json 
        headers['Content-Type'] = 'application/json'
      }

      const response = await fetch(url, {method, body, headers})
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Что то пошло не так')
      }

      setLoading(false)

      return data
    } catch(e) {
      console.log('Catch', e.message)
      setLoading(false)
      setError(e.message)
      throw e
    }
  }, [])

  //функция обновляет ошибки
  const clearError = useCallback(() => setError(null), [])

  return { loading, request, error, clearError}
}