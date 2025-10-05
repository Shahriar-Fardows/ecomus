import Image from "next/image";
import images from "../../../../public/images"; 

const Features = () => {
  const featuresData = [
    {
      id: 1,
      icon: images.svg.shipping,
      title: "Worldwide Shipping",
      description: "For all Orders Over $100",
    },
    {
      id: 2,
      icon: images.svg.guarantee,
      title: "Money Back Guarantee",
      description: "Guarantee Within 30 Days",
    },
    {
      id: 3,
      icon: images.svg.discounts,
      title: "Offers And Discounts",
      description: "Back Returns In 7 Days",
    },
    {
      id: 4,
      icon: images.svg.support,
      title: "24/7 Support",
      description: "Contact us Anytime",
    },
  ];

  return (
    <div className="container mx-auto border-t md:border-t-0 py-12">
      {/* Scroll version for mobile & tablet (desktop বাদে সব screen এ) */}
      <div className="flex gap-6 overflow-x-auto md:hidden hide-scrollbar pl-5">
        {featuresData.map((feature) => (
          <div
            key={feature.id}
            className="flex items-center gap-4 min-w-[250px]"
          >
            <Image
              src={feature.icon}
              alt={feature.title}
              width={50}
              height={50}
              className="flex-shrink-0"
            />
            <div>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-8">
        {featuresData.map((feature) => (
          <div
            key={feature.id}
            className="flex items-center gap-4 justify-center"
          >
            <Image
              src={feature.icon}
              alt={feature.title}
              width={50}
              height={50}
              className="flex-shrink-0"
            />
            <div>
              <h3 className="text-base md:text-lg font-semibold">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
