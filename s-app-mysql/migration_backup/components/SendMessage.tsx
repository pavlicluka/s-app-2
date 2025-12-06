import React, { useState } from 'react'
import { MessageSquare, Send, FileText } from 'lucide-react'

export default function SendMessage() {
  const [formData, setFormData] = useState({
    naročnik: '',
    telefon: '',
    email: '',
    zadeva: '',
    sporočilo: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Pripravi email vsebino
    const emailSubject = `Sporočilo: ${formData.zadeva}`
    const emailBody = `
Sporočilo preko kontaktnega obrazca

Naročnik: ${formData.naročnik}
Telefon: ${formData.telefon}
E-naslov: ${formData.email}

Zadeva: ${formData.zadeva}

Sporočilo:
${formData.sporočilo}

---
Poslano preko Standario kontaktnega obrazca
    `.trim()

    // Odpri email odjemalca
    const mailtoLink = `mailto:info@nis2.si?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    window.location.href = mailtoLink

    setTimeout(() => {
      setIsSubmitting(false)
      // Reset obrazca
      setFormData({
        naročnik: '',
        telefon: '',
        email: '',
        zadeva: '',
        sporočilo: ''
      })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Pošljite sporočilo</h1>
            <p className="text-text-tertiary">Kontaktni obrazec za pošiljanje sporočil</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Osnovni podatki */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Osnovni podatki
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Naročnik *
                </label>
                <input
                  type="text"
                  name="naročnik"
                  value={formData.naročnik}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="Vnesite vaše ime in priimek ali naziv podjetja"
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="telefon"
                  value={formData.telefon}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="Vnesite vašo telefonsko številko"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  E-naslov *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="Vnesite vaš e-naslov"
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Zadeva *
                </label>
                <input
                  type="text"
                  name="zadeva"
                  value={formData.zadeva}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="Kratek opis teme vašega sporočila"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sporočilo */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Vsebina sporočila
            </h3>
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Sporočilo *
              </label>
              <textarea
                name="sporočilo"
                value={formData.sporočilo}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="Vnesite vaše sporočilo..."
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-gray-500 text-white font-semibold rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? 'Pošiljam...' : 'Pošlji sporočilo'}
            </button>
          </div>
        </form>
      </div>

      {/* Information */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-accent-primary mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-text-primary mb-2">Navodila</h4>
            <p className="text-text-secondary text-sm">
              Ko kliknete "Pošlji sporočilo", se bo odprl vaš privzeti e-poštni odjemalec z vnaprej izpolnjenim e-poštnim naslovom 
              <strong> info@nis2.si </strong> in naslovom zadeve. Vsa polja, ki ste jih izpolnili, bodo samodejno vključena v telo e-pošte.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
