import { NgClass } from '@angular/common'
import { Component, inject, Input } from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { TranslatePipe } from '@ngx-translate/core'
import { InlineSVGModule } from 'ng-inline-svg-2'

import { ServiceTypeX } from '@/app/core/accessories/accessories.interfaces'
import { FilterMaintenanceManageComponent } from '@/app/core/accessories/types/filter-maintenance/filter-maintenance.manage.component'
import { LongClickDirective } from '@/app/core/directives/long-click.directive'

@Component({
  selector: 'app-filter-maintenance',
  templateUrl: './filter-maintenance.component.html',
  standalone: true,
  imports: [
    InlineSVGModule,
    NgClass,
    TranslatePipe,
    LongClickDirective,
  ],
})
export class FilterMaintenanceComponent {
  private $modal = inject(NgbModal)

  @Input() public service: ServiceTypeX

  public onClick() {
    const ref = this.$modal.open(FilterMaintenanceManageComponent, {
      size: 'md',
      backdrop: 'static',
    })
    ref.componentInstance.service = this.service
  }
}
