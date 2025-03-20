"use client"

import { getBasePath } from "@/lib/utils"

export default function GitHubRibbon() {
  return (
    <a
      href="https://github.com/VOTRE-NOM-UTILISATEUR/string-art-guide"
      className="absolute top-0 right-0 z-50 hidden md:block"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img width="149" height="149" src={`${getBasePath()}/github-corner.svg`} alt="Fork me on GitHub" />
    </a>
  )
}

