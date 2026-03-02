import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Heart, Bell, Truck, Users, MapPin, Bot, Shield, BarChart3, Smartphone, Award, Utensils, Leaf, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';
import aboutTeam from '@/assets/about-team.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const stats = [
  { icon: Utensils, number: '1.3B', label: 'Tons of Food Wasted Yearly' },
  { icon: Users, number: '690M', label: 'People Face Hunger Daily' },
  { icon: Heart, number: '50K', label: 'Meals Redirected Monthly' },
];

const steps = [
  { icon: Utensils, title: 'Log Surplus Food', desc: 'Donors quickly enter details about available surplus food including type, quantity, and pickup time.' },
  { icon: Bell, title: 'Instant Notification', desc: 'Nearby NGOs and shelters receive instant alerts about available food donations.' },
  { icon: Truck, title: 'Quick Pickup', desc: 'Recipients claim donations and arrange timely pickup to ensure food freshness.' },
  { icon: Heart, title: 'Nourish Communities', desc: 'Food reaches those in need, reducing hunger and environmental impact simultaneously.' },
];

const features = [
  { icon: MapPin, title: 'Real-Time Geolocation', desc: 'Smart matching based on proximity to minimize transportation time and maximize food freshness.' },
  { icon: Bot, title: 'AI-Powered Allocation', desc: 'Intelligent algorithms match surplus food with the most suitable recipients based on needs and capacity.' },
  { icon: Shield, title: 'Quality Assurance', desc: 'Food safety guidelines and freshness monitoring to ensure donated food meets quality standards.' },
  { icon: BarChart3, title: 'Data Analytics', desc: 'Insightful reporting on food waste patterns, demand hotspots, and impact measurement.' },
  { icon: Smartphone, title: 'Mobile Friendly', desc: 'Responsive design works seamlessly on all devices for donors and recipients on the go.' },
  { icon: Award, title: 'Impact Tracking', desc: 'Transparent reporting on meals saved, carbon footprint reduction, and community impact.' },
];

const impact = [
  { icon: Utensils, number: '500,000+', label: 'Meals Redirected' },
  { icon: Users, number: '200+', label: 'Partner Organizations' },
  { icon: Building, number: '50+', label: 'Cities Served' },
  { icon: Leaf, number: '300 Tons', label: 'CO2 Emissions Reduced' },
];

const testimonials = [
  { text: '"As a restaurant owner, we used to throw away perfectly good food daily. Now with Annadanam, we redirect our surplus to shelters."', name: 'Rajesh Kumar', role: 'Restaurant Owner, Delhi', initials: 'RK' },
  { text: '"The real-time notifications have been a game-changer for our shelter. We can now respond quickly to food donations."', name: 'Priya Sharma', role: 'Shelter Manager, Mumbai', initials: 'PS' },
  { text: '"Annadanam\'s platform is incredibly intuitive. As an event planner, I can quickly list leftover food from events."', name: 'Manjusha Pawar', role: 'Event Coordinator, Mumbai', initials: 'MP' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32" style={{ background: 'var(--hero-gradient)' }}>
        <div className="absolute inset-0 opacity-20">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-6"
          >
            Fighting Hunger, Reducing Waste
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10"
          >
            Annadanam connects food donors with NGOs and shelters in real-time, ensuring surplus food reaches those in need instead of landfills.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold text-base px-8"
              onClick={() => navigate(user ? '/donate-food' : '/signup')}
            >
              Donate Food
            </Button>
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold text-base px-8"
              onClick={() => navigate(user ? '/track' : '/signup')}
            >
              Receive Food
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center p-6 hover:-translate-y-1 transition-transform"
              >
                <s.icon className="h-10 w-10 text-secondary mx-auto mb-4" />
                <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">{s.number}</div>
                <p className="text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Annadanam Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Our streamlined process makes food redistribution simple, efficient, and impactful</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-card p-8 rounded-lg border border-border shadow-sm hover:-translate-y-2 transition-transform text-center"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Features</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Advanced technology solutions for efficient food redistribution</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-background p-8 rounded-lg border border-border hover:-translate-y-1 transition-transform"
              >
                <f.icon className="h-8 w-8 text-primary mb-5" />
                <h3 className="font-semibold text-lg mb-3">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">About Annadanam</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Our mission to create a world without hunger or food waste</p>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">Our Story</h3>
              <p className="text-muted-foreground mb-4">Annadanam was founded in 2020 with a simple yet powerful vision: to bridge the gap between food surplus and food scarcity.</p>
              <p className="text-muted-foreground mb-4">Our platform leverages technology to create an efficient ecosystem where surplus food from restaurants, events, and households can be quickly redirected to those in need.</p>
              <p className="text-muted-foreground mb-6">We believe that access to nutritious food is a basic human right, and through innovation and collaboration, we can solve the dual challenges of hunger and food waste.</p>
              <Button className="bg-primary text-primary-foreground" onClick={() => navigate(user ? '/donate-food' : '/signup')}>
                Join Our Mission
              </Button>
            </div>
            <div className="flex-1">
              <img src={aboutTeam} alt="Our volunteer team" className="rounded-lg shadow-lg w-full max-w-md mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="py-20" style={{ background: 'var(--impact-gradient)' }}>
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Our Impact</h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto">Transforming communities through efficient food redistribution</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impact.map((item, i) => (
              <motion.div
                key={item.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-8 text-center text-primary-foreground"
              >
                <item.icon className="h-10 w-10 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">{item.number}</h3>
                <p className="text-sm opacity-90">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Hear from our community of donors and recipients</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-card p-8 rounded-lg border border-border shadow-sm"
              >
                <p className="italic text-muted-foreground mb-6">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted-foreground flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{t.name}</h4>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: 'var(--hero-gradient)' }}>
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">Join the Movement Against Hunger and Waste</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Whether you have surplus food to donate or represent an organization helping those in need, Annadanam provides the technology to make food redistribution efficient and impactful.
          </p>
          <Button
            size="lg"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold px-8"
            onClick={() => navigate(user ? '/donate-food' : '/signup')}
          >
            Sign Up Today
          </Button>
        </div>
      </section>
    </div>
  );
}
