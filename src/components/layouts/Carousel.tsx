"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "react-router-dom";

interface Review {
  _id: string;
  title: string;
  content: string;
  rating: number;
  author?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  authorName?: string;
  createdAt: string;
  category: string;
}

interface CarouselPluginProps {
  reviews: Review[];
}

export function CarouselPlugin({ reviews }: CarouselPluginProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  // If no reviews, show placeholder content
  if (!reviews || reviews.length === 0) {
    return (
      <Carousel
        plugins={[plugin.current]}
        className="w-100 h-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="">
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index} className="">
              <div className="p-1">
                <Card className="bg-[#333] border-1 border-green-500 text-[#adadad]">
                  <CardContent className="flex flex-col aspect-square  p-6 relative">
                    <p className="text-2xl break-words text-center text-green-800">
                      Title
                    </p>
                    <p
                      className="mt-5 text-lg break-words absolute left-3 top-16 w-[85%]"
                      style={{ wordBreak: "break-word", lineBreak: "normal" }}
                    >
                      There are no reviews yet, you can leave a review{" "}
                      <strong>
                        <Link className="underline" to={"/contact"}>
                          here.
                        </Link>
                      </strong>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
  }

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-100 h-full "
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent className="">
        {reviews.map((review) => (
          <CarouselItem key={review._id} className="">
            <div className="p-1">
              <Card className="bg-[#333] border-1 border-green-500 text-[#adadad]">
                <CardContent className="flex flex-col aspect-square p-6 relative">
                  <div className="flex items-center justify-center mb-4 ">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-2xl ${
                            star <= review.rating
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-2xl break-words text-center text-green-400 mb-4">
                    {review.title}
                  </p>
                  <p
                    className="text-lg break-words text-center flex-1 overflow-hidden "
                    style={{ wordBreak: "break-word", lineBreak: "normal" }}
                  >
                    {review.content.length > 200
                      ? `${review.content.substring(0, 200)}...`
                      : review.content}
                  </p>
                  <div className="absolute bottom-5 right-3 flex items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center">
                      {review.author && review.author.avatar ? (
                        <img
                          src={review.author.avatar}
                          alt={`${review.author.firstName} ${review.author.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : review.author ? (
                        <span className="text-white text-lg font-semibold ">
                          {review.author.firstName.charAt(0)}
                          {review.author.lastName.charAt(0)}
                        </span>
                      ) : review.authorName ? (
                        <span className="text-white text-lg font-semibold">
                          {review.authorName
                            .split(" ")
                            .map((n) => n.charAt(0))
                            .join("")
                            .toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-white text-lg font-semibold">
                          A
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-md font-semibold">
                        {review.author
                          ? `${review.author.firstName} ${review.author.lastName}`
                          : review.authorName || "Anonymous User"}
                      </p>
                      <p className="text-md font-light ">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
