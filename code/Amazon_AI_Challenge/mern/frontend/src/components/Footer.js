import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full border-t border-[#e6e6db] dark:border-[#3a3928] py-8 mt-auto">
            <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-[#8c8b5f]">© 2026 Scheme Saarthi - Empowering Rural India. All rights reserved.</p>
                <div className="flex gap-6">
                    <a className="text-xs text-[#8c8b5f] hover:text-black dark:hover:text-white" href="#">Privacy</a>
                    <a className="text-xs text-[#8c8b5f] hover:text-black dark:hover:text-white" href="#">Terms</a>
                    <a className="text-xs text-[#8c8b5f] hover:text-black dark:hover:text-white" href="#">Help</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
