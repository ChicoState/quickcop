import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
} from "@nestjs/common";

import {
  WebScraperProductPreviewError,
  WebScraperProductPreviewService,
  type WebScraperProductPreview,
} from "./web-scraper-product-preview.service";

type WebScraperProductPreviewer = {
  preview(url: string): Promise<WebScraperProductPreview>;
};

type PreviewProductRequest = {
  url?: unknown;
};

@Controller("product-previews")
export class WebScraperProductPreviewController {
  constructor(
    @Inject(WebScraperProductPreviewService)
    private readonly productPreviewService: WebScraperProductPreviewer,
  ) {}

  @Post()
  async create(
    @Body() body: PreviewProductRequest,
  ): Promise<WebScraperProductPreview> {
    if (typeof body?.url !== "string" || body.url.trim().length === 0) {
      throw apiError(
        HttpStatus.BAD_REQUEST,
        "INVALID_URL",
        "A product URL is required.",
      );
    }

    try {
      return await this.productPreviewService.preview(body.url.trim());
    } catch (error) {
      if (error instanceof WebScraperProductPreviewError) {
        throw productPreviewApiError(error.code);
      }
      throw error;
    }
  }
}

function productPreviewApiError(
  code: WebScraperProductPreviewError["code"],
): HttpException {
  switch (code) {
    case "INVALID_URL":
      return apiError(
        HttpStatus.BAD_REQUEST,
        code,
        "Enter a valid HTTPS product URL.",
      );
    case "UNSAFE_URL":
      return apiError(
        HttpStatus.BAD_REQUEST,
        code,
        "This URL cannot be fetched.",
      );
    case "PRODUCT_NOT_FOUND":
      return apiError(
        HttpStatus.UNPROCESSABLE_ENTITY,
        code,
        "Product name or price was not found.",
      );
    case "FETCH_FAILED":
      return apiError(
        HttpStatus.BAD_GATEWAY,
        code,
        "The store page could not be fetched.",
      );
    case "UNSUPPORTED_PAGE":
      return apiError(
        HttpStatus.UNPROCESSABLE_ENTITY,
        code,
        "This page is not a supported product page.",
      );
  }
}

function apiError(
  status: HttpStatus,
  code: string,
  message: string,
): HttpException {
  return new HttpException({ error: { code, message } }, status);
}
