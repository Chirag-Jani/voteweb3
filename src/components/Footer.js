import React from "react";
import { BsGithub, BsLinkedin, BsTwitter } from "react-icons/bs";
import { HiMail } from "react-icons/hi";

const Footer = () => {
  return (
    <div>
      <footer className="fixed bottom-0 left-0 z-20 p-4 w-full bg-white border-t border-gray-200 shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 dark:border-gray-600">
        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2022 Chirag Jani
          {/* <a href="https://flowbite.com/" className="hover:underline">
            Flowbite™
          </a> */}{" "}
          | All Rights Reserved.
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
          <li>
            <a
              href="https://www.github.com/Chirag-Jani"
              target="_blank"
              className="mr-4 hover:underline md:mr-6 "
            >
              <BsGithub></BsGithub>
              Github
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/chirag-jani"
              target="_blank"
              className="mr-4 hover:underline md:mr-6"
            >
              <BsLinkedin></BsLinkedin>
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href="https://www.twitter.com/chiragjani001"
              target="_blank"
              className="mr-4 hover:underline md:mr-6"
            >
              <BsTwitter></BsTwitter>
              Twitter
            </a>
          </li>
          <li>
            <a
              href="mailto: chiragjani5901@gmail.com"
              target="__blank"
              className="hover:underline"
            >
              <HiMail></HiMail>
              Mail
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
};

export default Footer;
