'use client'

import { EarthComponent } from '@/components/EarthComponent'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Telescope, AlertTriangle } from 'lucide-react'
import ScrollIndicator from '@/components/ui/scrollIndicator'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function Presentation() {
  const t = useTranslations('presentation')
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white flex flex-col">
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 overflow-hidden">
        <div className="absolute inset-0 w-full h-screen z-0">
          <EarthComponent showMenu={false} cameraDistance={16} showStars={true} showHint={false} />
        </div>
        <div className="absolute inset-0 bg-black/60 z-10" />

        <div className="relative z-20 flex flex-col items-center justify-center py-32 px-6 max-w-4xl">
          <motion.h1 initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-5xl md:text-6xl font-bold mb-6">
            {t('hero.title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-lg md:text-xl text-gray-300 mb-8">
            {t('hero.subtitle')}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }}>
            <Link href="/">
              <Button className="text-lg px-8 py-6 rounded-2xl flex items-center gap-3">
                {t('hero.cta')}
                <ArrowRight className="w-6 h-6" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <ScrollIndicator targetId="features-section" />
      </section>

      <section id="features-section" className="grid md:grid-cols-3 gap-8 px-8 py-24 bg-gray-900/40 backdrop-blur-lg">
        <FeatureCard icon={<Telescope className="w-10 h-10 text-blue-400" />} title={t('features.data.title')} description={t('features.data.desc')} />
        <FeatureCard icon={<AlertTriangle className="w-10 h-10 text-yellow-400" />} title={t('features.impact.title')} description={t('features.impact.desc')} />
        <FeatureCard icon={<Shield className="w-10 h-10 text-green-400" />} title={t('features.mitigation.title')} description={t('features.mitigation.desc')} />
      </section>

      <section className="text-center py-24 bg-gradient-to-t from-gray-950 to-gray-900">
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-4xl font-bold mb-6">
          {t('callout.title')}
        </motion.h2>
        <p className="text-gray-400 mb-8">{t('callout.desc')}</p>
        <Button asChild className="w-1/3 mx-auto text-lg px-8 py-6 rounded-2xl flex items-center gap-3">
          <Link href="/">
            {t('callout.cta')}
            <ArrowRight className="w-6 h-6" />
          </Link>
        </Button>
      </section>

      <footer className="text-center py-6 text-gray-500 text-sm border-t border-gray-800">
        {t('footer', { year: new Date().getFullYear() })}
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="bg-gray-900/70 p-8 rounded-none border-2 border-gray-700 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
    >
      <div className="flex justify-center mb-6">{icon}</div>
      <h3 className="text-3xl font-bold mb-4 uppercase">{title}</h3>
      <p className="text-gray-300 text-lg">{description}</p>
    </motion.div>
  )
}

