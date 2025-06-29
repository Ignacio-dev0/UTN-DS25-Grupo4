import React from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

const faqData = [
  { question: '¿Cómo me registro para sacar un turno?', answer: 'Puedes registrarte haciendo clic en el botón "Log in" en la esquina superior derecha y seleccionando la opción "Crear cuenta". El proceso es rápido y solo requiere tu nombre y correo electrónico.' },
  { question: 'No he recibido el correo electrónico con el enlace para iniciar sesión. ¿Qué debo hacer?', answer: 'Primero, revisa tu carpeta de spam o correo no deseado. Si después de unos minutos no lo has recibido, puedes solicitar un nuevo enlace desde la pantalla de inicio de sesión.' },
  { question: '¿Cómo reservar un turno?', answer: 'Una vez que inicies sesión, utiliza la barra de búsqueda para encontrar una cancha por localidad, deporte y horario. Selecciona la cancha que prefieras y haz clic en un horario disponible para confirmar tu reserva.' },
  { question: '¿La reserva es instantánea o necesito una confirmación del club?', answer: 'La reserva es 100% instantánea. Una vez que confirmas el turno, la cancha es tuya para esa fecha y hora.' },
  { question: '¿Cómo sé si mi reserva está confirmada?', answer: 'Recibirás una confirmación por correo electrónico inmediatamente después de reservar. Además, podrás ver todas tus reservas activas en la sección "Mis Turnos" de tu perfil.' },
  { question: '¿Cuánto tiempo tengo para dar de baja una reserva?', answer: 'La política de cancelación depende de cada club, pero generalmente puedes cancelar sin costo hasta 24 horas antes del horario de tu reserva. Revisa los términos del club específico al momento de reservar.' },
  { question: '¿Qué pasa si no voy a jugar?', answer: 'Si no cancelas tu reserva y no te presentas, se aplicará la política de "no-show" del club, que puede incluir el cobro total de la cancha o una penalización en tu cuenta.' },
];

function FaqSection() {
    return (
        <section className='py-12'>
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold font-lora text-center text-secondary mb-8">
                    Preguntas frecuentes
                </h2>
                <div className="space-y-4">
                    {faqData.map((item, index) => (
                        <Disclosure as="div" key={index} className="border-b border-secondary">
                            {({ open }) => (
                                <>
                                    <DisclosureButton className="flex justify-between items-center w-full py-4 text-left text-lg font-semibold text-secondary">
                                        <span>{item.question}</span>
                                        <ChevronDownIcon className={`w-5 h-5 text-secondary transition-transform ${open ? 'transform rotate-180' : ''}`} />
                                    </DisclosureButton>
                                    <DisclosurePanel className="pb-4 text-black">
                                        {item.answer}
                                    </DisclosurePanel>
                                </>
                            )}
                        </Disclosure>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FaqSection;