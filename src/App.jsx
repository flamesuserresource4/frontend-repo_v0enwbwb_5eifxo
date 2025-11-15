import { useEffect, useRef, useState } from 'react'

const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [image, setImage] = useState(null)
  const [faces, setFaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [annotatedUrl, setAnnotatedUrl] = useState('')
  const fileInputRef = useRef(null)

  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(URL.createObjectURL(file))
    setFaces([])
    setAnnotatedUrl('')

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    try {
      // Fetch JSON predictions
      const res = await fetch(`${backendBase}/predict`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      setFaces(data.faces || [])

      // Fetch annotated preview
      const resImg = await fetch(`${backendBase}/predict/annotated`, {
        method: 'POST',
        body: formData,
      })
      const blob = await resImg.blob()
      setAnnotatedUrl(URL.createObjectURL(blob))
    } catch (e) {
      console.error(e)
      alert('Prediction failed. Please ensure the backend model is available.')
    } finally {
      setLoading(false)
    }
  }

  const launchPicker = () => fileInputRef.current?.click()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-xl p-8 border border-white">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              Gender Detection with Face Recognition
            </h1>
            <p className="text-gray-600 mt-2">Upload a photo. We’ll detect faces and predict gender for each one.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                <button onClick={launchPicker} className="px-5 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition">
                  Choose an image
                </button>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB</p>
              </div>

              {image && (
                <div className="mt-6 rounded-xl overflow-hidden border bg-white">
                  <img src={image} alt="preview" className="w-full object-contain max-h-[300px]" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="bg-gradient-to-br from-white to-gray-50 border rounded-xl p-6 h-full">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Results</h2>
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
                  </div>
                ) : faces.length > 0 ? (
                  <ul className="space-y-3">
                    {faces.map((f, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-white border rounded-lg p-3">
                        <div>
                          <p className="font-semibold text-gray-800">{f.label}</p>
                          <p className="text-sm text-gray-500">Confidence: {(f.confidence * 100).toFixed(1)}%</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${f.label === 'Male' ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-pink-700'}`}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No results yet. Upload an image to start.</p>
                )}
              </div>

              {annotatedUrl && (
                <div className="mt-6 rounded-xl overflow-hidden border bg-white">
                  <img src={annotatedUrl} alt="annotated" className="w-full object-contain max-h-[300px]" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            Backend: {backendBase}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
