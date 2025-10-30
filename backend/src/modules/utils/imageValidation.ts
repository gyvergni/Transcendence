import sharp from 'sharp';
import { MultipartFile } from '@fastify/multipart';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const OUTPUT_SIZE = 500;

export interface ImageValidationResult {
	valid: boolean;
	buffer?: Buffer;
	error?: string;
}

export async function sanitizeAndValidateImage(file: MultipartFile): Promise<ImageValidationResult> {
	try {
		if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
			return {
				valid: false,
				error: 'Only PNG and JPG images are allowed'
			};
		}

		const fileExtension = file.filename.split('.').pop()?.toLowerCase();
		if (!fileExtension || !['jpg', 'jpeg', 'png'].includes(fileExtension)) {
			return {
				valid: false,
				error: 'Invalid file extension. Only .jpg, .jpeg and .png are allowed'
			};
		}

		const buffer = await file.toBuffer();

		if (buffer.length > MAX_FILE_SIZE) {
			return {
				valid: false,
				error: 'File size exceeds 5MB limit'
			};
		}

		const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && 
		              buffer[2] === 0x4E && buffer[3] === 0x47;
		const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8;

		if (!isPNG && !isJPEG) {
			return {
				valid: false,
				error: 'File is not a valid PNG or JPEG image'
			};
		}

		const sanitized = await sharp(buffer)
			.resize(OUTPUT_SIZE, OUTPUT_SIZE, {
				fit: 'cover',
				position: 'center'
			})
			.png({ 
				quality: 90,
				compressionLevel: 9 
			})
			.toBuffer();

		return {
			valid: true,
			buffer: sanitized
		};

	} catch (error) {
		return {
			valid: false,
			error: 'Invalid or corrupted image file. Unable to process the image.'
		};
	}
}
