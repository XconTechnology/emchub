                    import Header from "@/components/Header";
                    import Footer from "@/components/Footer";
                    import { Link } from "wouter";
                    import { Button } from "@/components/ui/button";
                    import { Card, CardContent } from "@/components/ui/card";
                    import {
                      Clock,
                      Coins,
                      Users,
                      Heart,
                      Shield,
                      Repeat,
                      HandHeart,
                      Target,
                      ArrowRight,
                      CheckCircle,
                      DollarSign,
                      TrendingUp
                    } from "lucide-react";

                    export default function HowTimeBanksWork() {
                      return (
                        <>
                          <Header forceSolid />
                          <div className="min-h-screen bg-gray-50 pt-16">
                            {/* Hero Section */}
                            <section className="bg-gradient-to-br from-[#8FC24C] to-[#6B9A3A] text-white py-20">
                              <div className="container mx-auto px-4 text-center">
                                <div className="flex items-center justify-center mb-6">
                                  <Coins className="w-16 h-16" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">How TimeBanks Work</h1>
                                <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
                                  In TimeBanking, it's the time you give and receive that counts. Everyone's time is valued equally.
                                </p>
                              </div>
                            </section>

                            {/* Core Principle */}
                            <section className="py-16 bg-white">
                              <div className="container mx-auto px-4">
                                <div className="max-w-4xl mx-auto text-center">
                                  <h2 className="text-3xl font-bold text-gray-900 mb-6">The Fundamental Principle</h2>
                                  <p className="text-lg text-gray-700 leading-relaxed mb-8">
                                    The fundamental principle of TimeBanking is that{" "}
                                    <span className="font-bold text-[#8FC24C]">everyone's time is valued equally</span>. One hour of service
                                    rendered earns one TimeDollar (TD), irrespective of the type of service provided. At EMC HUB,{" "}
                                    <span className="font-bold">1 TD = HK$60</span>.
                                  </p>

                                  <div className="grid md:grid-cols-3 gap-6">
                                    <Card className="border-2 border-[#8FC24C]/30">
                                      <CardContent className="p-6 text-center">
                                        <div className="w-16 h-16 bg-[#8FC24C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                          <Clock className="w-8 h-8 text-[#8FC24C]" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">Earn TimeDollars</h3>
                                        <p className="text-gray-600">Complete services and earn TD when orders are marked as delivered</p>
                                      </CardContent>
                                    </Card>

                                    <Card className="border-2 border-[#8FC24C]/30">
                                      <CardContent className="p-6 text-center">
                                        <div className="w-16 h-16 bg-[#8FC24C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                          <Coins className="w-8 h-8 text-[#8FC24C]" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">Spend TimeDollars</h3>
                                        <p className="text-gray-600">Use your TD balance to pay for TD-eligible services and products</p>
                                      </CardContent>
                                    </Card>

                                    <Card className="border-2 border-[#8FC24C]/30">
                                      <CardContent className="p-6 text-center">
                                        <div className="w-16 h-16 bg-[#8FC24C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                          <DollarSign className="w-8 h-8 text-[#8FC24C]" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">Convert to Cash</h3>
                                        <p className="text-gray-600">Convert your TD to cash coupons at 1 TD = HK$60</p>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </div>
                              </div>
                            </section>

                            {/* How It Works Steps */}
                            <section className="py-16 bg-gray-50">
                              <div className="container mx-auto px-4">
                                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
                                <div className="max-w-5xl mx-auto">
                                  <div className="grid md:grid-cols-2 gap-8">
                                    {/* Service Exchange */}
                                    <Card className="overflow-hidden">
                                      <div className="bg-[#8FC24C] p-4">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                          <Repeat className="w-6 h-6" />
                                          Service Exchange
                                        </h3>
                                      </div>
                                      <CardContent className="p-6">
                                        <ul className="space-y-3">
                                          <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-[#8FC24C] flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">
                                              Services can vary widely—tutoring, home repairs, cooking, transportation, and more
                                            </span>
                                          </li>
                                          <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-[#8FC24C] flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">
                                              Focus on skills and support that individuals can offer within the community
                                            </span>
                                          </li>
                                          <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-[#8FC24C] flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">Vendors list their services with TD values on EMC HUB</span>
                                          </li>
                                        </ul>
                                      </CardContent>
                                    </Card>

                                    {/* Time Credits */}
                                    <Card className="overflow-hidden">
                                      <div className="bg-[#8FC24C] p-4">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                          <Coins className="w-6 h-6" />
                                          Time Credits
                                        </h3>
                                      </div>
                                      <CardContent className="p-6">
                                        <ul className="space-y-3">
                                          <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-[#8FC24C] flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">Earn TimeDollars for services you provide to other members</span>
                                          </li>
                                          <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-[#8FC24C] flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">TD is credited when orders are marked as "delivered"</span>
                                          </li>
                                          <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-[#8FC24C] flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">Use credits to receive help based on your needs</span>
                                          </li>
                                        </ul>
                                      </CardContent>
                                    </Card>

                                    {/* Community Building */}
                                    <Card className="overflow-hidden">
                                      <div className="bg-[#8FC24C] p-4">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                          <Users className="w-6 h-6" />
                                          Community Building
                                        </h3>
                                      </div>
                                      <CardContent className="p-6">
                                        <ul className="space-y-3">
                                          <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-[#8FC24C] flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">Emphasizes building relationships and community ties</span>
                                          </li>
                                          <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-[#8FC24C] flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">Encourages people to become involved in their local community</span>
                                          </li>
                                          <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-[#8FC24C] flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">Fosters trust and cooperation among members</span>
                                          </li>
                                        </ul>
                                      </CardContent>
                                    </Card>

                                    {/* Inclusivity */}
                                    <Card className="overflow-hidden">
                                      <div className="bg-[#8FC24C] p-4">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                          <Heart className="w-6 h-6" />
                                          Inclusivity
                                        </h3>
                                      </div>
                                      <CardContent className="p-6">
                                        <ul className="space-y-3">
                                          <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-[#8FC24C] flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">All-inclusive, allowing anyone to participate</span>
                                          </li>
                                          <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-[#8FC24C] flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">Each person's time is valued equally</span>
                                          </li>
                                          <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-[#8FC24C] flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">Promotes a sense of equality among participants</span>
                                          </li>
                                        </ul>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </div>
                              </div>
                            </section>

                            {/* 5 Core Values */}
                            <section className="py-16 bg-white">
                              <div className="container mx-auto px-4">
                                <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">The 5 Core Values of TimeBanking</h2>
                                <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                                  TimeBanking has a set of principles we live by
                                </p>

                                <div className="max-w-4xl mx-auto space-y-6">
                                  <Card className="border-l-4 border-l-[#8FC24C]">
                                    <CardContent className="p-6 flex items-start gap-4">
                                      <div className="w-12 h-12 bg-[#8FC24C] rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                        1
                                      </div>
                                      <div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">Asset</h3>
                                        <p className="text-gray-700">
                                          Everyone of us has something of value to share with someone else. Your skills, knowledge, and time
                                          are valuable assets that can benefit your community.
                                        </p>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="border-l-4 border-l-[#8FC24C]">
                                    <CardContent className="p-6 flex items-start gap-4">
                                      <div className="w-12 h-12 bg-[#8FC24C] rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                        2
                                      </div>
                                      <div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">Redefining Work</h3>
                                        <p className="text-gray-700">
                                          There are some forms of work that money will not easily pay for—like building strong families,
                                          revitalizing neighborhoods, and advancing social justice. TimeDollars reward, recognize, and honor
                                          that work.
                                        </p>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="border-l-4 border-l-[#8FC24C]">
                                    <CardContent className="p-6 flex items-start gap-4">
                                      <div className="w-12 h-12 bg-[#8FC24C] rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                        3
                                      </div>
                                      <div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">Reciprocity</h3>
                                        <p className="text-gray-700">
                                          The question "How can I help you?" needs to change so we ask: "Will you help someone too?" Paying
                                          it forward ensures that, together, we help each other build the world we all will live in.
                                        </p>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="border-l-4 border-l-[#8FC24C]">
                                    <CardContent className="p-6 flex items-start gap-4">
                                      <div className="w-12 h-12 bg-[#8FC24C] rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                        4
                                      </div>
                                      <div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">Community & Social Networks</h3>
                                        <p className="text-gray-700">
                                          By helping each other, we reweave communities of support, strength, and trust. Community is built
                                          by sinking roots, building trust, and creating networks.
                                        </p>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="border-l-4 border-l-[#8FC24C]">
                                    <CardContent className="p-6 flex items-start gap-4">
                                      <div className="w-12 h-12 bg-[#8FC24C] rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                        5
                                      </div>
                                      <div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">Respect</h3>
                                        <p className="text-gray-700">
                                          The heart and soul of democracy lies in respect for others. We strive to respect where people are
                                          in the moment, not where we hope they will be at some future point.
                                        </p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            </section>

                            {/* Benefits Section */}
                            <section className="py-16 bg-gray-50">
                              <div className="container mx-auto px-4">
                                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Benefits of TimeBanking in Your Community</h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                                  <Card>
                                    <CardContent className="p-6 text-center">
                                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Shield className="w-7 h-7 text-blue-600" />
                                      </div>
                                      <h3 className="font-bold text-lg mb-2">Promotes Trust</h3>
                                      <p className="text-gray-600 text-sm">
                                        Members build trust as they engage with one another, fostering community spirit and cooperation
                                      </p>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardContent className="p-6 text-center">
                                      <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <TrendingUp className="w-7 h-7 text-purple-600" />
                                      </div>
                                      <h3 className="font-bold text-lg mb-2">Enhances Skills</h3>
                                      <p className="text-gray-600 text-sm">
                                        Participants learn new skills while offering their expertise, promoting lifelong learning
                                      </p>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardContent className="p-6 text-center">
                                      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Target className="w-7 h-7 text-green-600" />
                                      </div>
                                      <h3 className="font-bold text-lg mb-2">Economic Resilience</h3>
                                      <p className="text-gray-600 text-sm">
                                        Supplements community resources, providing services that may not be accessible otherwise
                                      </p>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardContent className="p-6 text-center">
                                      <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <HandHeart className="w-7 h-7 text-orange-600" />
                                      </div>
                                      <h3 className="font-bold text-lg mb-2">Social Capital</h3>
                                      <p className="text-gray-600 text-sm">
                                        Strengthens social ties and networks, improving community resilience and support systems
                                      </p>
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            </section>

                            {/* EMC HUB Specific Info */}
                            <section className="py-16 bg-gradient-to-br from-[#8FC24C] to-[#6B9A3A] text-white">
                              <div className="container mx-auto px-4">
                                <div className="max-w-4xl mx-auto text-center">
                                  <h2 className="text-3xl font-bold mb-8">TimeDollars at EMC HUB</h2>

                                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-white/20 rounded-lg p-6">
                                      <div className="text-4xl font-bold mb-2">1 TD</div>
                                      <div className="text-lg">= HK$60</div>
                                      <p className="text-sm opacity-90 mt-2">Exchange rate</p>
                                    </div>

                                    <div className="bg-white/20 rounded-lg p-6">
                                      <div className="text-4xl font-bold mb-2">Earn</div>
                                      <div className="text-lg">On Delivery</div>
                                      <p className="text-sm opacity-90 mt-2">TD credited when orders complete</p>
                                    </div>

                                    <div className="bg-white/20 rounded-lg p-6">
                                      <div className="text-4xl font-bold mb-2">Spend</div>
                                      <div className="text-lg">TD-Eligible</div>
                                      <p className="text-sm opacity-90 mt-2">Use TD on marked listings</p>
                                    </div>
                                  </div>

                                  {/* ✅ UPDATED: centered two buttons */}
                                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link href="/events">
                                      <Button size="lg" className="bg-white text-[#8FC24C] hover:bg-gray-100 w-full sm:w-auto">
                                        Obtain TimeDollars
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                      </Button>
                                    </Link>

                                    <Link href="/dashboard/services">
                                      <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#8FC24C] transition-colors"
                                      >
                                        Host Event/Project
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </section>

                            {/* CTA Section */}
                            <section className="py-16 bg-white">
                              <div className="container mx-auto px-4 text-center">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join Our Community?</h2>
                                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                                  Start earning and spending TimeDollars today. Connect with Hong Kong's ethnic minority community through
                                  the power of time exchange.
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center">
                                  <Link href="/auth">
                                    <Button size="lg" className="bg-[#8FC24C] hover:bg-[#7AB03D]">
                                      Create Account
                                    </Button>
                                  </Link>
                                  <Link href="/directory">
                                    <Button size="lg" variant="outline">
                                      Browse Services
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </section>
                          </div>
                          <Footer />
                        </>
                      );
                    }
