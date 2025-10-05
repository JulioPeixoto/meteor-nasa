'use client';

import { EarthComponent } from "@/components/EarthComponent";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Telescope, AlertTriangle } from 'lucide-react';
import ScrollIndicator from "@/components/ui/scrollIndicator";
import Link from 'next/link';

export default function Presentation() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white flex flex-col">
            <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 overflow-hidden">
                <div className="absolute inset-0 w-full h-screen z-0">
                    <EarthComponent
                        showMenu={false}
                        cameraDistance={16}
                        showStars={true}
                        showHint={false}
                    />
                </div>
                <div className="absolute inset-0 bg-black/60 z-10" />

                <div className="relative z-20 flex flex-col items-center justify-center py-32 px-6 max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-6xl font-bold mb-6"
                    >
                        Simulador de Impacto de Asteroides
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-lg md:text-xl text-gray-300 mb-8"
                    >
                        Explore cenários reais de impactos de asteroides, visualize trajetórias e avalie estratégias de mitigação usando dados da NASA e USGS.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        <Link href="/">
                            <Button className="text-lg px-8 py-6 rounded-2xl flex items-center gap-3">
                                Iniciar Simulação
                                <ArrowRight className="w-6 h-6" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                <ScrollIndicator targetId="features-section" />
            </section>

            <section id="features-section" className="grid md:grid-cols-3 gap-8 px-8 py-24 bg-gray-900/40 backdrop-blur-lg">
                <FeatureCard
                    icon={<Telescope className="w-10 h-10 text-blue-400" />}
                    title="Dados de Asteroides"
                    description="Acesse informações detalhadas de NEOs."
                />
                <FeatureCard
                    icon={<AlertTriangle className="w-10 h-10 text-yellow-400" />}
                    title="Simulação de Impactos"
                    description="Preveja consequências de impactos com base em dados reais."
                />
                <FeatureCard
                    icon={<Shield className="w-10 h-10 text-green-400" />}
                    title="Mitigação de Danos"
                    description="Atitudes que poderiam ajudar a mitigar danos usando IA."
                />
            </section>

            <section className="text-center py-24 bg-gradient-to-t from-gray-950 to-gray-900">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl font-bold mb-6"
                >
                    Prepare-se para defender a Terra!
                </motion.h2>
                <p className="text-gray-400 mb-8">
                    Experimente o simulador e compreenda como pequenas mudanças na trajetória de um asteroide pode mudar tudo.
                </p>
                <Button asChild className="w-1/3 mx-auto text-lg px-8 py-6 rounded-2xl flex items-center gap-3">
                    <Link href="/">
                        Iniciar Simulação
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </Button>
            </section>

            <footer className="text-center py-6 text-gray-500 text-sm border-t border-gray-800">
                © {new Date().getFullYear()} Asteroid Impact Lab. Todos os direitos reservados.
            </footer>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-gray-800/50 p-6 rounded-2xl text-center shadow-lg hover:shadow-blue-900/30"
        >
            <div className="flex justify-center mb-4">{icon}</div>
            <h3 className="text-2xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-400">{description}</p>
        </motion.div>
    );
}
