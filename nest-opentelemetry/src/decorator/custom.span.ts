import { SetMetadata } from '@nestjs/common';
import { Constants } from '../Constants';

export const CustomSpan = () => SetMetadata(Constants.TRACE_METADATA, 'custom');
