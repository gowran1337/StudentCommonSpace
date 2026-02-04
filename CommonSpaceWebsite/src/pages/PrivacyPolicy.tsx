import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-lg shadow-xl p-8">
        <Link to="/profile" className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block">
          ← Tillbaka till Profil
        </Link>
        
        <h1 className="text-3xl font-bold text-white mb-6">Integritetspolicy & GDPR</h1>
        
        <div className="space-y-6 text-slate-200">
          {/* Vad vi samlar in */}
          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-3">1. Vilken data samlar vi in?</h2>
            <div className="bg-slate-700 rounded-lg p-4 space-y-2">
              <p><strong>Obligatorisk data:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>E-postadress (för inloggning och identifiering)</li>
                <li>Användar-ID (genererat automatiskt av systemet)</li>
              </ul>
              
              <p className="mt-4"><strong>Frivillig data:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Profilbild (emoji, inga riktiga bilder)</li>
                <li>Lägenhetskod (för att dela lägenhet med rumskamrater)</li>
                <li>Tema-preferenser (visuella inställningar)</li>
              </ul>
              
              <p className="mt-4"><strong>Användarskapat innehåll:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Chat-meddelanden</li>
                <li>Kalenderevenemang</li>
                <li>Utgifter och städschema</li>
                <li>Anslagstavla-poster</li>
              </ul>
            </div>
          </section>

          {/* Varför vi samlar in */}
          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-3">2. Varför samlar vi in denna data?</h2>
            <div className="bg-slate-700 rounded-lg p-4 space-y-2">
              <ul className="list-disc list-inside space-y-2">
                <li><strong>E-post & användar-ID:</strong> För autentisering och säker åtkomst till din lägenhet</li>
                <li><strong>Profilbild:</strong> För att identifiera dig i chattar och listor</li>
                <li><strong>Lägenhetskod:</strong> För att isolera data mellan olika lägenheter (RLS)</li>
                <li><strong>Användarskapat innehåll:</strong> För tjänstens kärnfunktionalitet (kommunikation mellan rumskamrater)</li>
              </ul>
            </div>
          </section>

          {/* Hur vi skyddar datan */}
          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-3">3. Hur skyddar vi din data?</h2>
            <div className="bg-slate-700 rounded-lg p-4 space-y-2">
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Row Level Security (RLS):</strong> Du ser bara data från din egen lägenhet</li>
                <li><strong>Autentisering:</strong> Endast inloggade användare har åtkomst</li>
                <li><strong>HTTPS:</strong> All kommunikation är krypterad</li>
                <li><strong>Supabase:</strong> Data lagras säkert hos Supabase (ISO 27001 certifierad)</li>
                <li><strong>Inga känsliga bilder:</strong> Endast emojis tillåts som profilbilder</li>
              </ul>
            </div>
          </section>

          {/* Dina rättigheter */}
          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-3">4. Dina GDPR-rättigheter</h2>
            <div className="bg-slate-700 rounded-lg p-4 space-y-2">
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Rätt till tillgång:</strong> Du kan exportera all din data (se Profil-sidan)</li>
                <li><strong>Rätt till radering:</strong> Du kan när som helst radera ditt konto och all data</li>
                <li><strong>Rätt till rättelse:</strong> Du kan ändra din profilbild och inställningar</li>
                <li><strong>Rätt till dataportabilitet:</strong> Exportera din data i JSON-format</li>
              </ul>
            </div>
          </section>

          {/* Datalagring */}
          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-3">5. Hur länge lagrar vi din data?</h2>
            <div className="bg-slate-700 rounded-lg p-4 space-y-2">
              <p>
                Din data lagras så länge ditt konto är aktivt. När du raderar ditt konto:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Raderas din profil omedelbart</li>
                <li>Dina meddelanden och innehåll raderas permanent</li>
                <li>Backup-kopior raderas inom 30 dagar</li>
              </ul>
            </div>
          </section>

          {/* Delning */}
          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-3">6. Delar vi din data med tredje part?</h2>
            <div className="bg-slate-700 rounded-lg p-4 space-y-2">
              <p><strong>NEJ.</strong> Vi delar ALDRIG din data med tredje part.</p>
              <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                <li>Ingen annonsering</li>
                <li>Ingen försäljning av data</li>
                <li>Ingen analytics/tracking</li>
              </ul>
              <p className="mt-2 text-sm text-slate-400">
                Undantag: Supabase är vår databashost och har teknisk åtkomst enligt deras tjänsteavtal.
              </p>
            </div>
          </section>

          {/* Kontakt */}
          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-3">7. Kontakta oss</h2>
            <div className="bg-slate-700 rounded-lg p-4">
              <p>
                Vid frågor om integritet eller GDPR, kontakta projektet via GitHub:
              </p>
              <a 
                href="https://github.com/gowran1337/StudentCommonSpace" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline mt-2 inline-block"
              >
                github.com/gowran1337/StudentCommonSpace
              </a>
            </div>
          </section>

          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mt-8">
            <p className="text-green-300 text-sm">
              ✓ Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
